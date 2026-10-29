const conversations = {};

const buildSystemPrompt = (agent, knowledgeContext) => {
  if (!agent) {
    return 'You are a helpful, knowledgeable AI assistant. Provide clear, accurate, and concise responses.';
  }
  const caps = Array.isArray(agent.capabilities) && agent.capabilities.length > 0
    ? agent.capabilities.join(', ')
    : 'general assistance';

  const basePrompt = [
    `You are "${agent.name || 'AI Assistant'}".`,
    agent.description ? `Description: ${agent.description}` : '',
    agent.purpose ? `Primary Purpose & Instructions: ${agent.purpose}` : '',
    agent.industry ? `Industry / Domain: ${agent.industry}` : '',
    `Enabled Capabilities: ${caps}.`,
    'Stay in character, be genuinely helpful, and directly answer the user\'s request with specific, actionable information.',
  ]
    .filter(Boolean)
    .join('\n');

  if (knowledgeContext && knowledgeContext.length > 0) {
    return basePrompt + '\n\n' +
      'You have access to the following knowledge from the business\'s own documents and website. Use this context to answer questions accurately. If the answer is not in the context, say you don\'t know rather than guessing.' +
      '\n\n' +
      knowledgeContext.map((c, i) => `[Context ${i + 1}] ${c.text}`).join('\n\n');
  }

  return basePrompt;
};

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom > 0 ? dot / denom : 0;
}

async function embedQuery(query, apiKey) {
  if (!apiKey) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
        dimensions: 256,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.data?.[0]?.embedding;
    }
  } catch (e) {
    console.error('Query embedding error:', e.message);
  }
  return null;
}

function keywordRetrieve(query, chunks, topK = 5) {
  const tokens = query.toLowerCase().split(/\W+/).filter(Boolean);
  if (tokens.length === 0) return chunks.slice(0, topK);

  const df = {};
  for (const chunk of chunks) {
    const words = new Set(chunk.text.toLowerCase().split(/\W+/).filter(Boolean));
    for (const word of words) {
      df[word] = (df[word] || 0) + 1;
    }
  }
  const idf = {};
  for (const word in df) {
    idf[word] = Math.log((chunks.length + 1) / (df[word] + 1)) + 1;
  }

  const scores = chunks.map((chunk, i) => {
    const words = chunk.text.toLowerCase().split(/\W+/).filter(Boolean);
    let score = 0;
    for (const word of tokens) {
      const tf = words.filter(w => w === word).length;
      score += tf * (idf[word] || 0);
    }
    return { index: i, score };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topK).map(s => chunks[s.index]);
}

async function retrieveContext(query, knowledgeBases, apiKey) {
  if (!knowledgeBases || knowledgeBases.length === 0) return [];

  const allChunks = knowledgeBases.flatMap(kb => kb.chunks || []);
  if (allChunks.length === 0) return [];

  const embeddedChunks = allChunks.filter(c => Array.isArray(c.embedding) && c.embedding.length > 0);

  if (embeddedChunks.length > 0) {
    const queryEmbedding = await embedQuery(query, apiKey);
    if (queryEmbedding) {
      const scores = embeddedChunks.map(c => ({
        chunk: c,
        score: cosineSimilarity(queryEmbedding, c.embedding),
      }));
      scores.sort((a, b) => b.score - a.score);
      return scores.slice(0, 5).map(s => s.chunk);
    }
  }

  // Fallback: keyword-based retrieval (TF-IDF)
  return keywordRetrieve(query, allChunks, 5);
}

const callLLM = async (messages, apiKey) => {
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');

  if (apiKey) {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        temperature: 0.7,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (reply) return reply;
    }
  }

  // Zero-config real LLM fallback via Pollinations OpenAI-compatible endpoint
  const pollRes = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      messages,
      temperature: 0.7,
    }),
  });

  if (pollRes.ok) {
    const data = await pollRes.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (reply) return reply;
  }

  throw new Error('LLM request failed');
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { sessionId, message, history = [], agent, knowledgeBases } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const activeSessionId = sessionId || 'session-' + Math.random().toString(36).slice(2, 11);

    const priorMessages = Array.isArray(history) && history.length > 0
      ? history.slice(-10).map(m => ({ role: m.role, content: m.content }))
      : (conversations[activeSessionId] || []).slice(-10);

    const queryText = String(message).trim();

    // Retrieve relevant knowledge context
    let knowledgeContext = [];
    try {
      knowledgeContext = await retrieveContext(queryText, knowledgeBases, process.env.OPENAI_API_KEY);
    } catch (e) {
      console.error('Context retrieval error:', e.message);
    }

    const systemPrompt = buildSystemPrompt(agent, knowledgeContext);

    const llmMessages = [
      { role: 'system', content: systemPrompt },
      ...priorMessages,
      { role: 'user', content: queryText },
    ];

    const response = await callLLM(llmMessages, process.env.OPENAI_API_KEY);

    conversations[activeSessionId] = [
      ...priorMessages,
      { role: 'user', content: queryText },
      { role: 'assistant', content: response },
    ];

    return res.status(200).json({
      sessionId: activeSessionId,
      response,
      knowledgeUsed: knowledgeContext.length,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

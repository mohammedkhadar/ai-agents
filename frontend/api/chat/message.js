const conversations = {};

const buildSystemPrompt = (agent) => {
  if (!agent) {
    return 'You are a helpful, knowledgeable AI assistant. Provide clear, accurate, and concise responses.';
  }
  const caps = Array.isArray(agent.capabilities) && agent.capabilities.length > 0
    ? agent.capabilities.join(', ')
    : 'general assistance';
  return [
    `You are "${agent.name || 'AI Assistant'}".`,
    agent.description ? `Description: ${agent.description}` : '',
    agent.purpose ? `Primary Purpose & Instructions: ${agent.purpose}` : '',
    agent.industry ? `Industry / Domain: ${agent.industry}` : '',
    `Enabled Capabilities: ${caps}.`,
    'Stay in character, be genuinely helpful, and directly answer the user\'s request with specific, actionable information.',
  ]
    .filter(Boolean)
    .join('\n');
};

async function callLLM(messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  if (apiKey) {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
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
}

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
    const { sessionId, message, history = [], agent } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const activeSessionId = sessionId || 'session-' + Math.random().toString(36).slice(2, 11);
    const systemPrompt = buildSystemPrompt(agent);

    const priorMessages = Array.isArray(history) && history.length > 0
      ? history.slice(-10).map(m => ({ role: m.role, content: m.content }))
      : (conversations[activeSessionId] || []).slice(-10);

    const llmMessages = [
      { role: 'system', content: systemPrompt },
      ...priorMessages,
      { role: 'user', content: String(message).trim() },
    ];

    const response = await callLLM(llmMessages);

    conversations[activeSessionId] = [
      ...priorMessages,
      { role: 'user', content: String(message).trim() },
      { role: 'assistant', content: response },
    ];

    return res.status(200).json({
      sessionId: activeSessionId,
      response,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

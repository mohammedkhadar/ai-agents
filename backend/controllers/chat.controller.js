// In-memory conversation storage for demo purposes
const conversations = {};

const generateSessionId = () => {
  return 'session-' + Math.random().toString(36).slice(2, 11);
};

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

export const sendMessage = async (req, res) => {
  try {
    const { sessionId, message, history = [], agent } = req.body || {};
    const activeSessionId = sessionId || generateSessionId();

    if (!conversations[activeSessionId]) {
      conversations[activeSessionId] = [];
    }

    const priorMessages = Array.isArray(history) && history.length > 0
      ? history.slice(-10).map(m => ({ role: m.role, content: m.content }))
      : conversations[activeSessionId].slice(-10);

    const llmMessages = [
      { role: 'system', content: buildSystemPrompt(agent) },
      ...priorMessages,
      { role: 'user', content: String(message || '').trim() },
    ];

    const response = await callLLM(llmMessages);

    conversations[activeSessionId] = [
      ...priorMessages,
      { role: 'user', content: String(message || '').trim() },
      { role: 'assistant', content: response },
    ];

    res.json({ sessionId: activeSessionId, response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversationHistory = (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = conversations[sessionId] || [];
    res.json({ sessionId, history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

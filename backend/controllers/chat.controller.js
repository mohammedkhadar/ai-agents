// In-memory conversation storage for demo purposes
const conversations = {};

const generateSessionId = () => {
  return 'session-' + Math.random().toString(36).slice(2, 11);
};

export const sendMessage = (req, res) => {
  try {
    const { sessionId, message, agent } = req.body;
    const activeSessionId = sessionId || generateSessionId();

    if (!conversations[activeSessionId]) {
      conversations[activeSessionId] = [];
    }
    conversations[activeSessionId].push({ role: 'user', content: message });

    const lowerMessage = (message || '').toLowerCase();
    const agentName = agent?.name || 'AI Assistant';
    const purpose = agent?.purpose || agent?.description || 'helping users with their requests';
    let response;

    if (lowerMessage.includes('hotel') && lowerMessage.includes('hamburg')) {
      response = `Here are 3 top hotel recommendations in Hamburg:\n1. Fairmont Hotel Vier Jahreszeiten — Luxury lakeside hotel on the Inner Alster.\n2. The Fontenay — Modern 5-star hotel in Rotherbaum with panoramic views.\n3. 25hours Hotel Hamburg HafenCity — Stylish boutique stay right in HafenCity.\n\nWould you like me to filter by budget or neighborhood?`;
    } else if (lowerMessage.includes('hotel')) {
      response = `As ${agentName}, I'd be happy to suggest hotels! Could you share your preferred city, budget, or travel dates?`;
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = `Hello! I'm ${agentName}, configured for ${purpose}. How can I assist you today?`;
    } else if (lowerMessage.includes('help') || lowerMessage.includes('what')) {
      response = `I'm ${agentName}. My purpose is: ${purpose}. Ask me anything to test how I respond!`;
    } else {
      response = `[${agentName}] I received your message: "${message}". Based on my configuration (${purpose}), I'm ready to assist—let me know any specific details you'd like me to handle.`;
    }

    conversations[activeSessionId].push({ role: 'assistant', content: response });
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

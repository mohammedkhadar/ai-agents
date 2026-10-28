// In-memory conversation storage for demo purposes
// In production, use a database like Redis or MongoDB
const conversations = {};

const generateSessionId = () => {
  return 'session-' + Math.random().toString(36).substr(2, 9);
};

export const sendMessage = (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId) {
      const newSessionId = generateSessionId();
      conversations[newSessionId] = [];
      conversations[newSessionId].push({ role: 'user', content: message });
      res.json({ sessionId: newSessionId, response: 'Hello! I am the AI agent builder chatbot. Please describe what kind of AI agent you would like to create.' });
    } else {
      if (!conversations[sessionId]) {
        conversations[sessionId] = [];
      }
      conversations[sessionId].push({ role: 'user', content: message });
      
      // Simple response logic for the conversational agent builder
      const lowerMessage = message.toLowerCase();
      let response;
      
      if (lowerMessage.includes('help') || lowerMessage.includes('what')) {
        response = 'I can help you create an AI agent through conversation! I will ask you some questions about what you need the agent to do, and then build it for you.';
      } else if (lowerMessage.includes('agent') || lowerMessage.includes('create')) {
        response = 'Great! Let me start by asking you a few questions to understand your needs. What should your AI agent be able to do?';
      } else if (lowerMessage.includes('name') || lowerMessage.includes('call')) {
        response = 'What would you like to name your AI agent?';
      } else if (lowerMessage.includes('purpose') || lowerMessage.includes('do')) {
        response = 'What specific tasks should your agent be able to perform?';
      } else if (lowerMessage.includes('industry') || lowerMessage.includes('business')) {
        response = 'Which industry or business context will your agent operate in?';
      } else {
        response = 'Thank you for that information. Let me ask another question to refine your agent\'s capabilities.';
      }
      
      conversations[sessionId].push({ role: 'assistant', content: response });
      res.json({ sessionId, response });
    }
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
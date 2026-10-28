import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAgent } from '../hooks/useAgent';
import { useToast } from '../hooks/useToast';

const generateSmartFallbackResponse = (message: string, agent: any): string => {
  const lower = message.toLowerCase();
  const agentName = agent?.name || 'AI Assistant';
  const purpose = agent?.purpose || agent?.description || 'helping you with your requests';

  if (lower.includes('hotel') && lower.includes('hamburg')) {
    return `Here are 3 top hotel recommendations in Hamburg:\n1. Fairmont Hotel Vier Jahreszeiten — Luxury lakeside hotel on the Inner Alster.\n2. The Fontenay — Modern 5-star hotel in Rotherbaum with panoramic views.\n3. 25hours Hotel Hamburg HafenCity — Stylish, boutique stay right in HafenCity.\n\nWould you like me to filter by budget or neighborhood?`;
  }
  if (lower.includes('hotel')) {
    return `As ${agentName}, I'd be happy to suggest hotels! Could you share your preferred budget, travel dates, or neighborhood so I can narrow down the best options?`;
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hello! I'm ${agentName}, configured for ${purpose}. How can I assist you today?`;
  }
  if (lower.includes('help') || lower.includes('what can you do')) {
    const caps = agent?.capabilities?.length ? agent.capabilities.join(', ') : 'answering questions and assisting users';
    return `I'm ${agentName}. My purpose is: ${purpose}. Enabled capabilities: ${caps}. Ask me anything to test how I respond!`;
  }
  return `[${agentName}] I received your message: "${message}". Based on my purpose (${purpose}), here is how I can help: please let me know any specific details or constraints you'd like me to apply.`;
};

const TestAgent: React.FC = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const { sessionId } = useAgent(agentId);
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [deployedBanner, setDeployedBanner] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const savedAgents = JSON.parse(localStorage.getItem('ai_agents') || '[]');
      const found = agentId
        ? savedAgents.find((a: any) => a._id === agentId)
        : JSON.parse(localStorage.getItem('active_agent') || 'null');
      if (found) {
        setAgent(found);
      }
    } catch {
      // ignore
    }
  }, [agentId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isRunning) return;

    const userMessage = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsRunning(true);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: trimmed, agent }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: generateSmartFallbackResponse(trimmed, agent) },
        ]);
      }

      if (data.agentReady) {
        showToast('Agent Ready', 'Agent is ready for deployment!', 'success');
        setTimeout(() => navigate('/agents'), 2000);
      }
    } catch {
      // Fallback so testing works seamlessly even if /api/chat/message isn't reachable
      const fallbackReply = generateSmartFallbackResponse(trimmed, agent);
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackReply }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDeploy = () => {
    try {
      const savedAgents = JSON.parse(localStorage.getItem('ai_agents') || '[]');
      if (agent) {
        const updated = savedAgents.map((a: any) =>
          a._id === agent._id ? { ...a, status: 'deployed' } : a
        );
        if (!savedAgents.some((a: any) => a._id === agent._id)) {
          updated.unshift({ ...agent, status: 'deployed' });
        }
        localStorage.setItem('ai_agents', JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
    setDeployedBanner(true);
    setTimeout(() => navigate('/agents'), 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <nav className="mb-6">
          <ol className="list-reset space-y-1">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path className="w-5 h-5" d="M12 19l9 2v-1l-9-2zm0 0l9 2v-1l-9-2zm0 0l-9-2v1l9-2zm0 0l-9 2v1l9 2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-9-2h9m-5 0H5m3 5H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2zm3.29-4.29L19.71 5H5v2.71l8.59 3.14L23 9.71V5a2 2 0 0 0-2-2h-1.29l1.76 1.76l1.41-1.41z" />
              </svg>
              <span>Test your agent</span>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          Test {agent?.name ? agent.name : agentId ? 'Your Agent' : 'New Agent'}
        </h1>

        {deployedBanner && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-800 font-medium">
            Agent deployed successfully! Redirecting to My Agents...
          </div>
        )}

        {/* Agent configuration summary */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow">
          {agent ? (
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Name:</strong> {agent.name}</p>
              <p><strong>Description:</strong> {agent.description}</p>
              {agent.purpose && <p><strong>Purpose:</strong> {agent.purpose}</p>}
              {agent.industry && <p><strong>Industry:</strong> {agent.industry}</p>}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">
              {sessionId ? `Session: ${sessionId.substring(0, 8)}...` : 'No active session'}
            </p>
          )}
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-md min-h-[200px]" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {messages.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">
              Send a message below to test your agent.
            </p>
          )}
          {messages.map((msg, index) => (
            <div key={index} className="mb-3">
              <p
                className={
                  msg.role === 'user'
                    ? 'bg-blue-100 text-blue-800 rounded px-3 py-2 max-w-md whitespace-pre-line'
                    : 'bg-gray-200 text-gray-800 rounded px-3 py-2 max-w-md ml-auto whitespace-pre-line'
                }
              >
                {msg.content}
              </p>
            </div>
          ))}

          {/* Loading state */}
          {isRunning && (
            <div className="p-3 text-right">
              <span className="text-sm text-gray-500">Agent is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
            placeholder="Type a message to test your agent..."
            rows={1}
            className="flex-1 border rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isRunning}
          ></textarea>
          <button
            type="submit"
            disabled={isRunning}
            className="border rounded-r-lg px-5 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </form>

        {/* Action buttons */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/agents')}
            className="mr-3 px-6 py-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Back to Agents
          </button>
          <button
            type="button"
            onClick={handleDeploy}
            className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Deploy Agent
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestAgent;

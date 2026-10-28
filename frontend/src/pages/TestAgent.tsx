import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAgent } from '../hooks/useAgent';
import { useToast } from '../hooks/useToast';

const TestAgent: React.FC = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const { sessionId } = useAgent(agentId);
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const { showToast } = useToast();

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isRunning) return;

    const userMessage: { role: string; content: string } = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsRunning(true);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: input }),
      });

      const data = await response.json();

      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }

      if (data.agentReady) {
        showToast('Agent is ready for deployment!', 'success');
        setTimeout(() => navigate('/agents'), 2000);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error occurred' }]);
      showToast('Error communicating with agent', 'error');
    } finally {
      setIsRunning(false);
    }
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
          Test {agentId ? 'Your Agent' : 'New Agent'}
        </h1>

        {/* Agent configuration summary */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow">
          <p className="text-gray-600 text-sm">
            {sessionId ? `Session: ${sessionId.substring(0, 8)}...` : 'No active session'}
          </p>
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-md" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {messages.map((msg, index) => (
            <div key={index} className="mb-3">
              <p 
                className={msg.role === 'user' ? 'bg-blue-100 text-blue-800 rounded px-3 py-2 max-w-md' : 'bg-gray-200 text-gray-800 rounded px-3 py-2 max-w-md ml-auto'}
              >
                {msg.content}
              </p>
            </div>
          ))}

          {/* Loading state */}
          {isRunning && (
            <div className="p-3 text-right">
              <span className="text-sm text-gray-500"> Agent is thinking... </span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message to test your agent..."
            rows={1}
            maxRows={3}
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
            onClick={() => navigate('/agents')}
            className="mr-3 px-6 py-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Back to Agents
          </button>
          <button
            onClick={() => navigate('/deploy')}
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
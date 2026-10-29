import React, { useState, useEffect } from 'react';
import { useAgent } from '../hooks/useAgent';

interface TestInterfaceProps {
  agentId?: string;
}

const TestInterface: React.FC<TestInterfaceProps> = ({ agentId }) => {
  const { sessionId } = useAgent(agentId);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Load conversation history when agent is loaded
    if (sessionId) {
      // TODO: Fetch conversation history from API
    }
  }, [sessionId]);

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
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error occurred' }]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="test-interface min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        {/* Agent Info */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Testing Agent
          </h2>
          <p className="text-gray-600">
            Agent ID: {agentId || 'New Agent'}
          </p>
        </div>

        {/* Chat Messages */}
        <div className="h-[500px] bg-white rounded-lg p-4 overflow-y-auto mb-6 shadow-md">
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
      </div>
    </div>
  );
};

export default TestInterface;
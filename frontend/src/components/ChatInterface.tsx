import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  agentId?: string;
  onAgentCreated?: (agent: any) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ agentId, onAgentCreated }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // If we have an agentId, load the agent's conversation flow
    if (agentId) {
      // TODO: Load agent from API
    }
  }, [agentId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: agentId || `temp-${Date.now()}`,
          message: input 
        }),
      });

      const data = await response.json();
      
      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }

      // If agent is created, navigate away or call callback
      if (data.agentCreated && onAgentCreated) {
        onAgentCreated(data.agent);
        navigate('/agents');
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
      // Focus the input again
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.value = '';
        setInput('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };
  void handleKeyDown;

  return (
    <div className="chat-interface min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            AI Agent Builder
          </h1>
          <p className="text-gray-600">
            Describe your needs to create a tailored AI agent
          </p>
        </div>

        {/* Chat Messages */}
        <div className="h-96 bg-white rounded-lg p-4 overflow-y-auto shadow-md" 
             style={{ maxHeight: '400px' }}>
          {messages.map((msg, index) => (
            <div key={index} className="mb-3">
              <p className={msg.role === 'user' ? 'bg-blue-100 text-blue-800 rounded px-3 py-2 max-w-xs' : 'bg-gray-200 text-gray-800 rounded px-3 py-2 max-w-xs ml-auto'}>
                {msg.content}
              </p>
            </div>
          ))}

          {/* Loading state */}
          {isLoading && messages.length > 0 && (
            <div className="mb-3 p-3 text-right">
              <span className="text-sm text-gray-500"> Thinking... </span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="mt-4">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me about your AI agent needs..."
              rows={1}
              className="flex-1 border rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            ></textarea>
            <button
              type="submit"
              disabled={isLoading}
              className="border rounded-r-lg px-5 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
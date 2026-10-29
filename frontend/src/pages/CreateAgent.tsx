import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentBuilder, { AgentConfig } from '../components/AgentBuilder';
import Navbar from '../components/Navbar';

const CreateAgent: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'wizard' | 'chat'>('wizard');
  const [chatStep, setChatStep] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [chatDraft, setChatDraft] = useState({
    name: '',
    description: '',
    purpose: '',
    industry: 'customer-service',
    capabilities: ['text-generation', 'customer-service'],
  });
  const [chatMessages, setChatMessages] = useState<{ role: 'assistant' | 'user'; content: string }[]>([
    {
      role: 'assistant',
      content: 'Hi! Tell me what kind of AI agent you want to build (for example: "A travel concierge that recommends hotels and itineraries in Europe"), and I will configure it for you.',
    },
  ]);

  const handleAgentCreated = async (agentConfig: AgentConfig) => {
    const newAgent = {
      _id: 'agent-' + Math.random().toString(36).slice(2, 10),
      name: agentConfig.name,
      description: agentConfig.description,
      purpose: agentConfig.purpose,
      industry: agentConfig.industry,
      capabilities: agentConfig.capabilities,
      config: {
        model: agentConfig.model,
        temperature: agentConfig.temperature,
        systemPrompt: `You are ${agentConfig.name}. Description: ${agentConfig.description}. Purpose: ${agentConfig.purpose}. Industry: ${agentConfig.industry}.`,
      },
      status: 'testing',
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('ai_agents') || '[]');
      localStorage.setItem('ai_agents', JSON.stringify([newAgent, ...existing]));
      localStorage.setItem('active_agent', JSON.stringify(newAgent));
    } catch (e) {
      console.error('Failed to save agent to localStorage:', e);
    }

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent),
      });
      if (res.ok) {
        const saved = await res.json();
        if (saved && saved._id) {
          newAgent._id = saved._id;
          localStorage.setItem('active_agent', JSON.stringify({ ...newAgent, ...saved }));
        }
      }
    } catch {
      // Backend optional — localStorage already saved
    }

    const encodedConfig = btoa(encodeURIComponent(JSON.stringify({
      name: newAgent.name,
      description: newAgent.description,
      purpose: newAgent.purpose,
      industry: newAgent.industry,
      capabilities: newAgent.capabilities,
    })));
    navigate(`/test-agent/${newAgent._id}?cfg=${encodedConfig}`);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    setChatMessages(prev => [...prev, { role: 'user', content: text }]);
    setChatInput('');

    if (chatStep === 0) {
      setChatDraft(prev => ({ ...prev, description: text, purpose: text }));
      setChatStep(1);
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Got it! What would you like to name this AI agent?' },
      ]);
    } else {
      const finalName = text;
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Creating "${finalName}" and opening the test environment...` },
      ]);
      setTimeout(() => {
        handleAgentCreated({
          name: finalName,
          description: chatDraft.description,
          purpose: chatDraft.purpose,
          industry: chatDraft.industry,
          capabilities: chatDraft.capabilities,
          model: 'gpt-4o-mini',
          temperature: 0.7,
        });
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Agent Creation Studio</span>
          </div>
          <div className="inline-flex rounded-lg bg-gray-200 p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode('wizard')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                mode === 'wizard' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Step-by-Step Wizard
            </button>
            <button
              type="button"
              onClick={() => setMode('chat')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                mode === 'chat' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Conversational Builder
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          Build Your AI Agent
        </h1>

        {mode === 'wizard' ? (
          <AgentBuilder onComplete={handleAgentCreated} />
        ) : (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`rounded-lg px-4 py-2.5 max-w-md text-sm ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder={chatStep === 0 ? 'Describe what your agent should do...' : 'Enter a name for your agent...'}
                className="flex-1 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* Feature highlights below the form */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Conversation</h3>
              <p className="text-gray-500 text-sm">
                Describe your needs in natural conversation
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Configuration</h3>
              <p className="text-gray-500 text-sm">
                Set agent name, purpose, industry and capabilities
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Testing</h3>
              <p className="text-gray-500 text-sm">
                Test your agent with live AI responses before deploying
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAgent;

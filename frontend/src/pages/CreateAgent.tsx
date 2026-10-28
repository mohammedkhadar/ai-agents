import React from 'react';
import { useNavigate } from 'react-router-dom';
import AgentBuilder, { AgentConfig } from '../components/AgentBuilder';

const CreateAgent: React.FC = () => {
  const navigate = useNavigate();

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

    // Save locally so the flow works even if backend is offline
    try {
      const existing = JSON.parse(localStorage.getItem('ai_agents') || '[]');
      localStorage.setItem('ai_agents', JSON.stringify([newAgent, ...existing]));
      localStorage.setItem('active_agent', JSON.stringify(newAgent));
    } catch (e) {
      console.error('Failed to save agent to localStorage:', e);
    }

    // Attempt to save to backend API as well
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

    navigate(`/test-agent/${newAgent._id}`);
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
              <span>Step-by-step creation</span>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          Build Your AI Agent
        </h1>

        <AgentBuilder onComplete={handleAgentCreated} />

        {/* Feature highlights below the form */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path className="w-5 h-5" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <path className="w-5 h-5" d="M3 13h2l6 6v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2l6-6h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2z" />
                  <circle className="w-1 h-1 fill-current" cx="10" cy="10" r="7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Conversation</h3>
              <p className="text-gray-500">
                Describe your needs in natural conversation
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path className="w-5 h-5" d="M12 15m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />
                  <path className="w-5 h-5" d="M12 2v2m0 16v-2m7-5h-6L12 6l-3 5H3" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Configuration</h3>
              <p className="text-gray-500">
                Set agent name, purpose, industry and capabilities
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path className="w-5 h-5" d="M12 15L23 10M12 15l-5-5h5M12 15l-5 5h5" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Testing</h3>
              <p className="text-gray-500">
                Test your agent before deploying
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAgent;

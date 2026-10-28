import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAgent } from '../hooks/useAgent';

const AgentDetail: React.FC = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const { sessionId } = useAgent(agentId);
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(null);

  useEffect(() => {
    try {
      const savedAgents = JSON.parse(localStorage.getItem('ai_agents') || '[]');
      const found = savedAgents.find((a: any) => a._id === agentId);
      if (found) setAgent(found);
    } catch {
      // ignore
    }
  }, [agentId]);

  const goBack = () => navigate('/agents');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <nav className="mb-6">
          <ol className="list-reset space-y-1">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path className="w-5 h-5" d="M12 19l9 2v-1l-9-2zm0 0l9 2v-1l-9-2zm0 0l-9-2v1l9-2zm0 0l-9 2v1l9 2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-9-2h9m-5 0H5m3 5H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2zm3.29-4.29L19.71 5H5v2.71l8.59 3.14L23 9.71V5a2 2 0 0 0-2-2h-1.29l1.76 1.76l1.41-1.41z" />
              </svg>
              <span>Agent detail</span>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          {agent?.name || `Agent ${agentId ? `(ID: ${agentId.substring(0, 8)}...)` : ''}`}
        </h1>

        <div className="bg-white rounded-lg p-6 shadow mb-6 space-y-3">
          {agent && (
            <div className="space-y-2 text-gray-700 border-b pb-4">
              <p><strong>Description:</strong> {agent.description}</p>
              {agent.purpose && <p><strong>Purpose:</strong> {agent.purpose}</p>}
              {agent.industry && <p><strong>Industry:</strong> {agent.industry}</p>}
              {agent.capabilities?.length > 0 && (
                <p><strong>Capabilities:</strong> {agent.capabilities.join(', ')}</p>
              )}
              {agent.status && <p><strong>Status:</strong> {agent.status}</p>}
            </div>
          )}
          <p className="text-gray-600 text-sm">
            Session: {sessionId ? `Active session: ${sessionId.substring(0, 8)}...` : 'No active session.'}
          </p>

          <div className="mt-4 flex gap-2 pt-2">
            <button
              onClick={() => navigate(`/test-agent/${agentId}`)}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Test Agent
            </button>
            <button
              onClick={goBack}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Back to Agents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetail;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAgent } from '../hooks/useAgent';
import Navbar from '../components/Navbar';
import { useAuth } from '../auth/AuthContext';
import { loadUserAgents, saveUserAgents } from '../lib/storage';
import KnowledgeUploader from '../components/KnowledgeUploader';

const AgentDetail: React.FC = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const { sessionId } = useAgent(agentId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const uid = user?.uid || 'guest';
  const [agent, setAgent] = useState<any>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);

  useEffect(() => {
    try {
      const savedAgents = loadUserAgents(uid);
      const found = savedAgents.find((a: any) => a._id === agentId) || null;
      setAgent(found);
      if (found) {
        setKnowledgeBases(found.knowledgeBases || found.config?.knowledgeBases || []);
      }
    } catch {
      // ignore
    }
  }, [agentId, uid]);

  const goBack = () => navigate('/agents');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          {agent?.name || `Agent ${agentId ? `(ID: ${agentId.substring(0, 8)}...)` : ''}`}
        </h1>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 space-y-3">
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
          <p className="text-gray-500 text-sm">
            Session: {sessionId ? `Active session: ${sessionId.substring(0, 8)}...` : 'No active session.'}
          </p>

          <div className="mt-4 flex gap-3 pt-2">
            <button
              onClick={() => navigate(`/test-agent/${agentId}`)}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Chat with Agent
            </button>
            <button
              onClick={goBack}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to My Agents
            </button>
          </div>
        </div>

        {/* Knowledge Base Management */}
        {agent && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Business Knowledge Base</h2>
            <p className="text-gray-500 text-sm mb-4">
              Upload documents or add website URLs to teach your agent about your specific business.
              The agent will use this content to answer questions accurately.
            </p>
            <KnowledgeUploader
              agentId={agentId || ''}
              existing={knowledgeBases}
              onChange={(kbs) => {
                setKnowledgeBases(kbs);
                const updated = {
                  ...agent,
                  knowledgeBases: kbs,
                  config: { ...agent.config, knowledgeBases: kbs },
                };
                setAgent(updated);
                try {
                  const all = loadUserAgents(uid);
                  const idx = all.findIndex((a: any) => a._id === agentId);
                  if (idx >= 0) {
                    all[idx] = updated;
                    saveUserAgents(uid, all);
                  }
                } catch { /* ignore */ }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDetail;

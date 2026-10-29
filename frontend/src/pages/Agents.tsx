import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import Navbar from '../components/Navbar';
import { useAuth } from '../auth/AuthContext';
import { loadUserAgents, saveUserAgents } from '../lib/storage';

const Agents: React.FC = () => {
  const { toasts, showToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const uid = user?.uid || 'guest';
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localAgents = loadUserAgents(uid);

    fetch('/api/agents')
      .then(res => {
        if (!res.ok) throw new Error('API unavailable');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge remote and local agents without duplicates
          const merged = [...localAgents];
          for (const remote of data) {
            if (!merged.some(a => a._id === remote._id)) {
              merged.push(remote);
            }
          }
          setAgents(merged);
        } else {
          setAgents(localAgents);
        }
        setLoading(false);
      })
      .catch(() => {
        setAgents(localAgents);
        setLoading(false);
      });
  }, []);

  const deleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      await fetch(`/api/agents/${id}`, { method: 'DELETE' });
    } catch {
      // ignore if backend unavailable
    }
    const updated = agents.filter(agent => agent._id !== id);
    setAgents(updated);
    saveUserAgents(uid, updated);
    showToast('Deleted', 'Agent deleted successfully', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <span className="text-gray-500">Loading agents...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        {toasts.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50 space-y-2">
            {toasts.map(t => (
              <div
                key={t.id}
                className="px-4 py-3 rounded-lg shadow-lg text-sm font-medium bg-gray-900 text-white"
              >
                <div className="font-bold">{t.title}</div>
                {t.description && <div>{t.description}</div>}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">
            My Agents
          </h1>
          <Link
            to="/create-agent"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Create New Agent
          </Link>
        </div>

        {agents.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
            <p className="text-gray-500 mb-4">
              No agents yet. Create your first AI agent below.
            </p>
            <Link
              to="/create-agent"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Your First Agent
            </Link>
          </div>
        )}

        <div className="grid gap-4">
          {agents.map((agent) => (
            <div
              key={agent._id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      {agent.name}
                    </h2>
                    {agent.status && (
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          agent.status === 'deployed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {agent.status}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    {agent.description}
                  </p>
                  {agent.purpose && (
                    <p className="text-gray-400 text-xs mt-1">
                      Purpose: {agent.purpose}
                    </p>
                  )}
                  {(agent.knowledgeBases || agent?.config?.knowledgeBases || []).length > 0 && (
                    <p className="text-xs text-indigo-600 mt-1">
                      📚 {(agent.knowledgeBases || agent?.config?.knowledgeBases || []).length} knowledge source(s)
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/test-agent/${agent._id}`)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    Chat / Test
                  </button>
                  <button
                    onClick={() => navigate(`/agent/${agent._id}`)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => deleteAgent(agent._id)}
                    className="px-3 py-1.5 text-red-500 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Created: {new Date(agent.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Agents;

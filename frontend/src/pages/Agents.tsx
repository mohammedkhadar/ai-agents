import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAgent } from '../hooks/useAgent';
import { useToast } from '../hooks/useToast';

const Agents: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { sessionId } = useAgent();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch agents from API
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => {
        setAgents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching agents:', err);
        setLoading(false);
        showToast('Error loading agents', 'error');
      });
  }, [showToast]);

  const deleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      await fetch(`/api/agents/${id}`, { method: 'DELETE' });
      setAgents(prev => prev.filter(agent => agent._id !== id));
      showToast('Agent deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting agent:', err);
      showToast('Error deleting agent', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Loading agents...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <nav className="mb-6">
          <ol className="list-reset space-y-1">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path className="w-5 h-5" d="M12 19l9 2v-1l-9-2zm0 0l9 2v-1l-9-2zm0 0l-9-2v1l9-2zm0 0l-9 2v1l9 2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-9-2h9m-5 0H5m3 5H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2zm3.29-4.29L19.71 5H5v2.71l8.59 3.14L23 9.71V5a2 2 0 0 0-2-2h-1.29l1.76 1.76l1.41-1.41z" />
              </svg>
              <span>Your agents</span>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          My Agents
        </h1>

        {agents.length === 0 && (
          <div className="bg-white rounded-lg p-8 text-center shadow">
            <p className="text-gray-500 mb-4">
              No agents yet. Create your first agent below.
            </p>
            <Link to "/create-agent"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              Create Your First Agent
            </Link>
          </div>
        )}

        <div className="grid gap-4">
          {agents.map((agent) => (
            <div
              key={agent._id}
              className="bg-white rounded-lg p-6 shadow-hover transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {agent.name}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {agent.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/test-agent/${agent._id}`)}
                    className="text-indigo-600 text-sm hover:text-indigo-800 transition-colors"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => navigate(`/agent/${agent._id}`)}
                    className="text-green-600 text-sm hover:text-green-800 transition-colors"
                  >
                    View
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
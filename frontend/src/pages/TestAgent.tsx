import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAgent } from '../hooks/useAgent';
import { useToast } from '../hooks/useToast';
import Navbar from '../components/Navbar';
import Markdown from '../components/Markdown';
import { useAuth } from '../auth/AuthContext';
import { loadUserAgents, getActiveAgent, saveUserAgents, setActiveAgent } from '../lib/storage';

const buildSystemPrompt = (agent: any) => {
  if (!agent) {
    return 'You are a helpful, knowledgeable AI assistant. Provide clear, accurate, and concise responses.';
  }
  const caps = Array.isArray(agent.capabilities) && agent.capabilities.length > 0
    ? agent.capabilities.join(', ')
    : 'general assistance';
  return [
    `You are "${agent.name || 'AI Assistant'}".`,
    agent.description ? `Description: ${agent.description}` : '',
    agent.purpose ? `Primary Purpose & Instructions: ${agent.purpose}` : '',
    agent.industry ? `Industry / Domain: ${agent.industry}` : '',
    `Enabled Capabilities: ${caps}.`,
    'Stay in character, be genuinely helpful, and directly answer the user\'s request with specific, actionable information.',
  ]
    .filter(Boolean)
    .join('\n');
};

const TestAgent: React.FC = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { sessionId } = useAgent(agentId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const uid = user?.uid || 'guest';
  const [agent, setAgent] = useState<any>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const { toasts, showToast } = useToast();

  useEffect(() => {
    // 1. Check URL ?cfg= parameter (for shared links)
    const cfgParam = searchParams.get('cfg');
    let decodedCfg: any = null;
    if (cfgParam) {
      try {
        decodedCfg = JSON.parse(decodeURIComponent(atob(cfgParam)));
      } catch {
        // ignore invalid cfg param
      }
    }

    // 2. Check localStorage (scoped to the signed-in user)
    try {
      const savedAgents = loadUserAgents(uid);
      const found = agentId
        ? savedAgents.find((a: any) => a._id === agentId)
        : getActiveAgent(uid);

      if (found) {
        setAgent(found);
      } else if (decodedCfg) {
        const reconstructed = {
          _id: agentId || 'shared-agent',
          ...decodedCfg,
          status: 'deployed',
          createdAt: new Date().toISOString(),
        };
        setAgent(reconstructed);
      }
    } catch {
      if (decodedCfg) {
        setAgent({ _id: agentId || 'shared-agent', ...decodedCfg });
      }
    }
  }, [agentId, searchParams, uid]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isRunning) return;

    const userMessage = { role: 'user', content: trimmed };
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput('');
    setIsRunning(true);

    try {
      let replyText = '';

      // 1. Call serverless backend API (/api/chat/message)
      try {
        const response = await fetch('/api/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            message: trimmed,
            history: messages.slice(-10),
            agent,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.response) {
            replyText = data.response;
          }
        }
      } catch {
        // Backend unreachable; fall through to direct LLM call
      }

      // 2. Direct real LLM call if serverless route wasn't available
      if (!replyText) {
        const llmRes = await fetch('https://text.pollinations.ai/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'openai',
            messages: [
              { role: 'system', content: buildSystemPrompt(agent) },
              ...messages.slice(-10),
              { role: 'user', content: trimmed },
            ],
            temperature: 0.7,
          }),
        });

        if (llmRes.ok) {
          const llmData = await llmRes.json();
          replyText = llmData?.choices?.[0]?.message?.content || '';
        }
      }

      if (!replyText) {
        throw new Error('Could not generate response');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: replyText }]);
    } catch {
      showToast('Error', 'Error communicating with AI service. Please try again.', 'error');
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered a temporary issue reaching the AI model. Please try sending your message again.' },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDeploy = () => {
    const active = agent || {
      _id: agentId || 'agent-' + Math.random().toString(36).slice(2, 10),
      name: 'General AI Assistant',
      description: 'Helpful conversational AI agent',
      purpose: 'Answer user questions accurately and helpfully',
      industry: 'customer-service',
      capabilities: ['text-generation'],
      createdAt: new Date().toISOString(),
    };

    const deployedAgent = { ...active, status: 'deployed' };
    setAgent(deployedAgent);

    try {
      const savedAgents = loadUserAgents(uid);
      const exists = savedAgents.some((a: any) => a._id === deployedAgent._id);
      const updated = exists
        ? savedAgents.map((a: any) => (a._id === deployedAgent._id ? deployedAgent : a))
        : [deployedAgent, ...savedAgents];
      saveUserAgents(uid, updated);
      setActiveAgent(uid, deployedAgent);
    } catch {
      // ignore
    }

    const encoded = btoa(
      encodeURIComponent(
        JSON.stringify({
          name: deployedAgent.name,
          description: deployedAgent.description,
          purpose: deployedAgent.purpose,
          industry: deployedAgent.industry,
          capabilities: deployedAgent.capabilities,
        })
      )
    );
    const url = `${window.location.origin}/test-agent/${deployedAgent._id}?cfg=${encoded}`;
    setShareUrl(url);
    showToast('Agent Deployed!', 'Your agent is live and ready to share.', 'success');
  };

  const copyShareUrl = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        {/* Toast Banner */}
        {toasts.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50 space-y-2">
            {toasts.map(t => (
              <div
                key={t.id}
                className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
                  t.variant === 'error'
                    ? 'bg-red-600 text-white'
                    : t.variant === 'success'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-900 text-white'
                }`}
              >
                <div className="font-bold">{t.title}</div>
                {t.description && <div>{t.description}</div>}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>Live Agent Playground</span>
          </div>
          {agent?.status && (
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                agent.status === 'deployed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {agent.status === 'deployed' ? '● Deployed' : '● Testing'}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          {agent?.name ? `Chat with ${agent.name}` : 'Test Your AI Agent'}
        </h1>

        {shareUrl && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-900">
            <div className="font-bold mb-1">Agent Deployed! Shareable Live Link:</div>
            <div className="flex items-center gap-2 mt-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 text-xs bg-white border border-green-300 rounded px-3 py-2 text-gray-700"
              />
              <button
                type="button"
                onClick={copyShareUrl}
                className="px-3 py-2 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        )}

        {/* Agent configuration summary */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
          {agent ? (
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Name:</strong> {agent.name}</p>
              {agent.description && <p><strong>Description:</strong> {agent.description}</p>}
              {agent.purpose && <p><strong>Purpose:</strong> {agent.purpose}</p>}
              {agent.industry && <p><strong>Industry:</strong> {agent.industry}</p>}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">
              Testing general AI assistant ({sessionId ? `Session: ${sessionId.substring(0, 8)}...` : 'Ready'})
            </p>
          )}
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-md min-h-[260px]" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {messages.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-12">
              Send a message below to chat with your AI agent in real time.
            </p>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-lg whitespace-pre-line text-sm'
                    : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-lg text-sm'
                }
              >
                {msg.role === 'user' ? msg.content : <Markdown content={msg.content} />}
              </div>
            </div>
          ))}

          {isRunning && (
            <div className="p-2 text-left">
              <span className="inline-block bg-gray-100 text-gray-500 text-sm px-4 py-2 rounded-2xl animate-pulse">
                Agent is thinking...
              </span>
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
            className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isRunning}
          ></textarea>
          <button
            type="submit"
            disabled={isRunning || !input.trim()}
            className="rounded-lg px-6 py-3 bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </form>

        {/* Action buttons */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/agents')}
            className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Back to My Agents
          </button>
          <button
            type="button"
            onClick={handleDeploy}
            className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            {agent?.status === 'deployed' ? 'Get Share Link' : 'Deploy Agent'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestAgent;

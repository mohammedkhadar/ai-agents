import { useState, useEffect } from 'react';

interface AgentSession {
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
}

export const useAgent = (agentId?: string) => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // If we have an agentId, create or join a session with that agent's config
    if (agentId) {
      // In a real app, this would fetch the agent configuration from the API
      // and set up the session based on the agent's conversation flow
      setSessionId(`session-${agentId}-${Date.now()}`);
    } else {
      // Create a new temporary session
      const newSessionId = `temp-${Date.now()}`;
      setSessionId(newSessionId);
    }
  }, [agentId]);

  return { sessionId, setSessionId };
};
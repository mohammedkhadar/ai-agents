// Per-user agent storage helpers (localStorage scoped by user id).
// Falls back to a shared guest scope when no user is signed in.

export type StoredAgent = {
  _id: string;
  name: string;
  description: string;
  purpose?: string;
  industry?: string;
  capabilities?: string[];
  config?: { model?: string; temperature?: number; systemPrompt?: string };
  status?: string;
  createdAt: string;
};

const key = (uid: string) => `ai_agents:${uid || 'guest'}`;
const activeKey = (uid: string) => `active_agent:${uid || 'guest'}`;
const MIGRATED_KEY = 'ai_agents_migrated_v1';

export function loadUserAgents(uid: string): StoredAgent[] {
  try {
    return JSON.parse(localStorage.getItem(key(uid)) || '[]');
  } catch {
    return [];
  }
}

export function saveUserAgents(uid: string, agents: StoredAgent[]) {
  try {
    localStorage.setItem(key(uid), JSON.stringify(agents));
  } catch {
    // ignore quota errors
  }
}

export function getActiveAgent(uid: string): StoredAgent | null {
  try {
    return JSON.parse(localStorage.getItem(activeKey(uid)) || 'null');
  } catch {
    return null;
  }
}

export function setActiveAgent(uid: string, agent: StoredAgent | null) {
  try {
    if (agent) {
      localStorage.setItem(activeKey(uid), JSON.stringify(agent));
    } else {
      localStorage.removeItem(activeKey(uid));
    }
  } catch {
    // ignore
  }
}

// One-time migration: move pre-auth agents (key `ai_agents`) into the signed-in user's scope.
export function migrateLegacyAgents(uid: string) {
  try {
    if (localStorage.getItem(MIGRATED_KEY) === 'true') return;
    const legacy = localStorage.getItem('ai_agents');
    if (legacy) {
      const legacyList: StoredAgent[] = JSON.parse(legacy || '[]');
      if (Array.isArray(legacyList) && legacyList.length > 0) {
        const current = loadUserAgents(uid);
        const merged = [...legacyList.filter(l => !current.some(c => c._id === l._id)), ...current];
        saveUserAgents(uid, merged);
      }
      localStorage.removeItem('ai_agents');
    }
    localStorage.setItem(MIGRATED_KEY, 'true');
  } catch {
    // ignore
  }
}

// Session token helpers
const TOKEN_KEY = 'session_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function decodeTokenPayload(token: string): any | null {
  try {
    const [data] = token.split('.');
    if (!data) return null;
    return JSON.parse(atob(data.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

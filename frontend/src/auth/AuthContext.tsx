import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  decodeTokenPayload,
  migrateLegacyAgents,
} from '../lib/storage';
import { SSO_CONFIG } from '../lib/ssoConfig';

export interface AuthUser {
  uid: string;
  name: string;
  email?: string | null;
  avatar?: string | null;
  provider: 'google' | 'github' | 'guest';
}

interface AuthSsoConfig {
  google: string;
  github: string;
  hasGithubSecret: boolean;
  hasAuthSecret: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  ssoConfig: AuthSsoConfig | null;
  signInWithGoogleCredential: (credential: string) => Promise<void>;
  buildGitHubAuthorizeUrl: () => string | null;
  completeGitHubSignIn: (code: string) => Promise<void>;
  continueAsGuest: (name?: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [ssoConfig, setSsoConfig] = useState<AuthSsoConfig | null>(null);

  // Restore session on load
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      // Guest session restore
      try {
        const guest = JSON.parse(localStorage.getItem('guest_session') || 'null');
        if (guest?.uid) {
          setUser(guest);
          migrateLegacyAgents(guest.uid);
        }
      } catch {
        // ignore
      }
      setReady(true);
      return;
    }

    const decoded = decodeTokenPayload(token);
    (async () => {
      try {
        const res = await fetch('/api/auth/session', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          migrateLegacyAgents(data.user.uid);
        } else if (decoded && decoded.exp && decoded.exp > Date.now()) {
          // Server unreachable — keep local session until next check
          setUser({
            uid: decoded.uid,
            name: decoded.name,
            email: decoded.email,
            avatar: decoded.avatar,
            provider: decoded.provider,
          });
          migrateLegacyAgents(decoded.uid);
        } else {
          clearStoredToken();
        }
      } catch {
        if (decoded && decoded.exp && decoded.exp > Date.now()) {
          setUser({
            uid: decoded.uid,
            name: decoded.name,
            email: decoded.email,
            avatar: decoded.avatar,
            provider: decoded.provider,
          });
          migrateLegacyAgents(decoded.uid);
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Load SSO configuration:
  // - Client IDs come from Vite build-time env (VITE_ prefix) — always public
  // - Server-side secret availability comes from /api/auth/config
  useEffect(() => {
    fetch('/api/auth/config')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('config unavailable'))))
      .then((cfg) =>
        setSsoConfig({
          google: cfg.google || SSO_CONFIG.googleClientId,
          github: cfg.github || SSO_CONFIG.githubClientId,
          hasGithubSecret: cfg.hasGithubSecret || false,
          hasAuthSecret: cfg.hasAuthSecret || false,
        })
      )
      .catch(() =>
        setSsoConfig({
          google: SSO_CONFIG.googleClientId,
          github: SSO_CONFIG.githubClientId,
          hasGithubSecret: false,
          hasAuthSecret: false,
        })
      );
  }, []);

  const signInWithGoogleCredential = useCallback(async (credential: string) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    const data = await res.json();
    if (!res.ok || !data.token) {
      throw new Error(data.message || 'Google sign-in failed');
    }
    localStorage.removeItem('guest_session');
    setStoredToken(data.token);
    setUser(data.user);
    migrateLegacyAgents(data.user.uid);
  }, []);

  const buildGitHubAuthorizeUrl = useCallback((): string | null => {
    // Prefer server-side client ID, fall back to public build-time one
    const clientId = (ssoConfig?.github || '') || SSO_CONFIG.githubClientId;
    if (!clientId) return null;

    const redirectUri = window.location.origin + '/login';
    const state = Math.random().toString(36).slice(2);
    sessionStorage.setItem('github_oauth_state', state);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'read:user user:email',
      state,
    });
    return 'https://github.com/login/oauth/authorize?' + params.toString();
  }, [ssoConfig, SSO_CONFIG.githubClientId]);

  const completeGitHubSignIn = useCallback(
    async (code: string) => {
      const res = await fetch('/api/auth/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          redirectUri: window.location.origin + '/login',
          // Send public client ID to the server for token exchange.
          // The secret is read from process.env on the server.
          clientId: SSO_CONFIG.githubClientId,
        }),
      });
    const data = await res.json();
    if (!res.ok || !data.token) {
      throw new Error(data.message || 'GitHub sign-in failed');
    }
    localStorage.removeItem('guest_session');
    setStoredToken(data.token);
    setUser(data.user);
    migrateLegacyAgents(data.user.uid);
  }, [SSO_CONFIG.githubClientId]);

  const continueAsGuest = useCallback((name?: string) => {
    const guest: AuthUser = {
      uid: 'guest-' + Math.random().toString(36).slice(2, 10),
      name: name?.trim() || 'Guest',
      email: null,
      avatar: null,
      provider: 'guest',
    };
    clearStoredToken();
    localStorage.setItem('guest_session', JSON.stringify(guest));
    setUser(guest);
    migrateLegacyAgents(guest.uid);
  }, []);

  const signOut = useCallback(() => {
    clearStoredToken();
    localStorage.removeItem('guest_session');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        ssoConfig,
        signInWithGoogleCredential,
        buildGitHubAuthorizeUrl,
        completeGitHubSignIn,
        continueAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

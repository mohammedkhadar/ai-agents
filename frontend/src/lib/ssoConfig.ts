/// <reference types="vite/client" />

// Public SSO configuration, inlined at build time via Vite VITE_ variables.
// These values are intentionally public — Google/GitHub client IDs are designed
// to be embedded in frontend code (they are NOT secrets).
// Secrets (GITHUB_CLIENT_SECRET, AUTH_SECRET) remain server-side env vars.

interface ImportMetaEnv {
  VITE_GOOGLE_CLIENT_ID?: string;
  VITE_GITHUB_CLIENT_ID?: string;
  readonly [key: string]: string | undefined;
}

export const SSO_CONFIG = {
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  githubClientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
};

export const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/gsi/client';
export const GITHUB_AUTH_BASE = 'https://github.com/login/oauth/authorize';

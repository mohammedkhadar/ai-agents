import { SSO_CONFIG } from '../lib/ssoConfig';

// Fetches the live config of which server-side secrets are available.
// Client IDs are public (inlined via Vite); secrets are server-side env vars.

export async function fetchSsoConfig(): Promise<{
  google: boolean;
  github: boolean;
  serverGoogle: boolean;
  serverGithub: boolean;
}> {
  // Check if server-side verification is available
  let serverGoogle = false;
  let serverGithub = false;
  try {
    const res = await fetch('/api/auth/config');
    if (res.ok) {
      const data = await res.json();
      serverGoogle = !!data.google;
      serverGithub = !!data.github;
    }
  } catch {
    // fallback: assume server-side not configured
  }

  return {
    google: !!SSO_CONFIG.googleClientId, // public client ID always available to UI
    github: !!SSO_CONFIG.githubClientId,
    serverGoogle: serverGoogle || !!SSO_CONFIG.googleClientId,
    serverGithub: serverGithub,
  };
}

// Builds the GitHub OAuth URL (client ID is public)
export function buildGitHubUrl(redirectUri: string): string | null {
  if (!SSO_CONFIG.githubClientId) return null;
  const state = Math.random().toString(36).slice(2);
  sessionStorage.setItem('github_oauth_state', state);
  const params = new URLSearchParams({
    client_id: SSO_CONFIG.githubClientId,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
    state,
  });
  return `${'https://github.com/login/oauth/authorize'}?${params.toString()}`;
}

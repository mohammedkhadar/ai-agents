import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { SSO_CONFIG } from '../lib/ssoConfig';

const Login: React.FC = () => {
  const { ssoConfig, signInWithGoogleCredential, buildGitHubAuthorizeUrl, completeGitHubSignIn, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<'google' | 'github' | null>(null);
  const from = (location.state as any)?.from || '/agents';

  const done = () => navigate(from, { replace: true });

  // Google OAuth 2.0 redirect flow: extract id_token from URL hash
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const idToken = params.get('id_token');
    if (idToken) {
      window.history.replaceState({}, '', '/login');
      setBusy('google');
      setError('');
      signInWithGoogleCredential(idToken)
        .then(done)
        .catch(e => {
          setError((e as Error).message || 'Google sign-in failed');
          setBusy(null);
        });
    }
  }, [signInWithGoogleCredential, done]);

  // GitHub OAuth callback: ?code=...&state=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      window.history.replaceState({}, '', '/login');
      setBusy('github');
      setError('');
      completeGitHubSignIn(code)
        .then(done)
        .catch(e => {
          setError((e as Error).message || 'GitHub sign-in failed');
          setBusy(null);
        });
    }
  }, [completeGitHubSignIn, done]);

  const handleGoogle = () => {
    setError('');
    const clientId = SSO_CONFIG.googleClientId;
    if (!clientId) {
      setError('Google sign-in is not configured.');
      return;
    }
    // OAuth 2.0 implicit flow for ID token (redirect-based, works on static hosting)
    const url =
      'https://accounts.google.com/o/oauth2/v2/auth?' +
      new URLSearchParams({
        client_id: clientId,
        redirect_uri: window.location.origin + '/login',
        response_type: 'id_token',
        scope: 'openid email profile',
        nonce: Math.random().toString(36).slice(2),
        state: Math.random().toString(36).slice(2),
        hd: '*',
      }).toString();
    window.location.href = url;
  };

  const handleGitHub = () => {
    setError('');
    const url = buildGitHubAuthorizeUrl();
    if (!url) {
      setError('GitHub sign-in is not configured yet.');
      return;
    }
    window.location.href = url;
  };

  const hasGoogle = !!(ssoConfig?.google || SSO_CONFIG.googleClientId);
  const hasGithub = !!(ssoConfig?.github || SSO_CONFIG.githubClientId);
  const anySso = !!(hasGoogle || hasGithub);

  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  const GithubIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            AI
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Sign in to AI Agent Platform</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Create, test and deploy AI agents with your own account.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={!hasGoogle || busy !== null}
              className={`w-full flex items-center justify-center gap-3 border rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                hasGoogle
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50'
                  : 'border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
              title={hasGoogle ? undefined : 'Set VITE_GOOGLE_CLIENT_ID to enable'}
            >
              <GoogleIcon />
              {busy === 'google' ? 'Signing in with Google…' : 'Continue with Google'}
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={handleGitHub}
              disabled={!hasGithub || busy !== null}
              className={`w-full flex items-center justify-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                hasGithub
                  ? 'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50'
                  : 'border border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
              title={hasGithub ? undefined : 'Set VITE_GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to enable'}
            >
              <GithubIcon />
              {busy === 'github' ? 'Signing in with GitHub…' : 'Continue with GitHub'}
            </button>

            {anySso && <div className="flex items-center gap-3 my-2"><div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">or</span><div className="flex-1 h-px bg-gray-200" /></div>}

            {/* Guest */}
            <button
              type="button"
              onClick={() => { continueAsGuest(); done(); }}
              disabled={busy !== null}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              Continue as Guest (this device only)
            </button>
          </div>

          {!anySso && (
            <details className="mt-6 text-sm text-gray-600">
              <summary className="cursor-pointer font-medium text-gray-700">
                ⚙️ Enable Google & GitHub sign-in (one-time setup)
              </summary>
              <ol className="mt-3 space-y-2 list-decimal list-outside ml-4">
                <li>
                  <strong>Google:</strong> In <a className="underline" href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>, create an OAuth client ID with redirect URI <code className="bg-gray-100 px-1 rounded">{typeof window !== 'undefined' ? window.location.origin + '/login' : ''}</code>, then set <code className="bg-gray-100 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> in Vercel.
                </li>
                <li>
                  <strong>GitHub:</strong> In <a className="underline" href="https://github.com/settings/developers" target="_blank" rel="noopener noreferrer">GitHub → OAuth Apps</a>, create an app with callback URL <code className="bg-gray-100 px-1 rounded">{typeof window !== 'undefined' ? window.location.origin + '/login' : ''}</code>, then set <code className="bg-gray-100 px-1 rounded">VITE_GITHUB_CLIENT_ID</code> and <code className="bg-gray-100 px-1 rounded">GITHUB_CLIENT_SECRET</code> in Vercel.
                </li>
                <li>Set <code className="bg-gray-100 px-1 rounded">AUTH_SECRET</code> (run <code className="bg-gray-100 px-1 rounded">openssl rand -hex 32</code>).</li>
                <li>Redeploy (Redeploy → uncheck "Use existing build cache").</li>
              </ol>
            </details>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Guest mode stores agents in this browser only. Sign in to keep them tied to your account.
        </p>
      </div>
    </div>
  );
};

export default Login;

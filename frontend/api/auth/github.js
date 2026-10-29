import { setCors, signSession, publicUser } from '../_lib/session.js';

// GitHub OAuth code exchange + user profile fetch, then issues a session.
// POST { code, redirectUri, clientId }
// Requires GITHUB_CLIENT_SECRET env var. Client ID may come from env
// or the request body (it is public and may be inlined at build time).

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  // Client ID is public — accept from env var OR request body
  const clientId = process.env.GITHUB_CLIENT_ID || req.body?.clientId;
  if (!clientId || !clientSecret) {
    return res.status(501).json({
      message: 'GitHub sign-in is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.',
    });
  }

  try {
    const { code, redirectUri } = req.body || {};
    if (!code) {
      return res.status(400).json({ message: 'Missing code' });
    }

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        ...(redirectUri ? { redirect_uri: redirectUri } : {}),
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res
        .status(401)
        .json({ message: tokenData.error_description || 'GitHub token exchange failed' });
    }

    const headers = {
      Authorization: 'Bearer ' + tokenData.access_token,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'ai-agent-platform',
    };

    const profileRes = await fetch('https://api.github.com/user', { headers });
    if (!profileRes.ok) {
      return res.status(401).json({ message: 'Failed to fetch GitHub profile' });
    }
    const profile = await profileRes.json();

    let email = profile.email;
    if (!email) {
      try {
        const emailsRes = await fetch('https://api.github.com/user/emails', { headers });
        if (emailsRes.ok) {
          const emails = await emailsRes.json();
          email = emails.find(e => e.primary && e.verified)?.email || emails[0]?.email || null;
        }
      } catch {
        // email optional
      }
    }

    const user = {
      uid: 'github:' + profile.id,
      name: profile.name || profile.login || 'GitHub User',
      email,
      avatar: profile.avatar_url || null,
      provider: 'github',
    };

    const token = signSession(user);
    return res.status(200).json({ token, user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

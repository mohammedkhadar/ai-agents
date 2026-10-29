import { setCors, signSession, publicUser } from '../_lib/session.js';

// Verifies a Google Identity Services ID token and issues a session.
// POST { credential: <ID token JWT> }
// GOOGLE_CLIENT_ID is optional server-side: if set, audience is verified.
// If not set (env var doesn't reach the function), we still verify the token
// is valid via Google's tokeninfo endpoint but accept any valid audience.

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { credential } = req.body || {};
    if (!credential) {
      return res.status(400).json({ message: 'Missing credential' });
    }

    // Verify token via Google's server-side validation endpoint
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!verifyRes.ok) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const claims = await verifyRes.json();
    const now = Date.now();
    if (claims.exp && Number(claims.exp) * 1000 < now) {
      return res.status(401).json({ message: 'Token expired' });
    }

    // Audience check (optional, when server-side client ID is available)
    const serverClientId = process.env.GOOGLE_CLIENT_ID;
    if (serverClientId && claims.aud !== serverClientId) {
      return res.status(401).json({ message: 'Token audience mismatch' });
    }

    const user = {
      uid: 'google:' + claims.sub,
      name: claims.name || claims.email?.split('@')[0] || 'Google User',
      email: claims.email || null,
      avatar: claims.picture || null,
      provider: 'google',
    };

    const token = signSession(user);
    return res.status(200).json({ token, user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

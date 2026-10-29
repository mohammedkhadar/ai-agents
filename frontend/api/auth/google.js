import { setCors, signSession, publicUser } from '../_lib/session.js';

// Verifies a Google Identity Services ID token and issues a session.
// POST { credential: <ID token JWT> }
// Requires GOOGLE_CLIENT_ID env var.

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(501).json({ message: 'Google sign-in is not configured. Set GOOGLE_CLIENT_ID.' });
  }

  try {
    const { credential } = req.body || {};
    if (!credential) {
      return res.status(400).json({ message: 'Missing credential' });
    }

    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!verifyRes.ok) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }
    const claims = await verifyRes.json();

    if (claims.aud !== clientId) {
      return res.status(401).json({ message: 'Token audience mismatch' });
    }
    if (claims.exp && Number(claims.exp) * 1000 < Date.now()) {
      return res.status(401).json({ message: 'Token expired' });
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

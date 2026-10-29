import { setCors, verifySession, getBearerToken, publicUser } from '../_lib/session.js';

// Verifies a session token. GET with `Authorization: Bearer <token>`.

export default function handler(req, res) {
  if (setCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  const payload = verifySession(token);
  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  return res.status(200).json({ user: publicUser(payload) });
}

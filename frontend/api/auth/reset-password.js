import { setCors } from '../_lib/session.js';
import { verifyToken } from '../_lib/tokens.js';
import { findUserByEmail, updateUserPassword, hashPassword, publicUser } from '../_lib/users.js';
import { signSession } from '../_lib/session.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token, password } = req.body || {};
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Verify the reset token
    const payload = verifyToken(token);
    if (!payload || payload.purpose !== 'password-reset') {
      return res.status(401).json({ message: 'Invalid or expired reset token' });
    }

    // Find the user and update their password
    const user = await findUserByEmail(payload.email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordHash = hashPassword(password);
    await updateUserPassword(payload.email, passwordHash);

    // Issue a new session token so the user is logged in immediately
    const pub = publicUser(user);
    const sessionToken = signSession(pub);

    res.status(200).json({ token: sessionToken, user: pub });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message || 'Error resetting password' });
  }
}

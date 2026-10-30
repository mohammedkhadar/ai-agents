import { setCors } from '../_lib/session.js';
import { findUserByEmail, verifyUserPassword, publicUser, signSession } from '../_lib/users.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await findUserByEmail(normalizedEmail);

    if (!user || !verifyUserPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const pub = publicUser(user);
    const token = signSession(pub);
    res.status(200).json({ token, user: pub });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
}

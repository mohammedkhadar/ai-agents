import { setCors } from '../_lib/session.js';
import { findUserByEmail, createUser, hashPassword, publicUser, signSession, getDebugInfo } from '../_lib/users.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, username, password } = req.body || {};

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists. Sign in instead.' });
    }

    // Hash password and create user
    const passwordHash = hashPassword(password);
    const user = await createUser({
      email: normalizedEmail,
      username: (username || email.split('@')[0]).trim(),
      passwordHash,
    });

    // Create session token
    const pub = publicUser(user);
    const token = signSession(pub);
    res.status(201).json({ token, user: pub, _debug: getDebugInfo() });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message || 'Registration failed', _debug: getDebugInfo() });
  }
}

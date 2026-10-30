import bcrypt from 'bcryptjs';
import { setCors, signSession, getBearerToken, verifySession, publicUser } from '../_lib/session.js';
import { findUserByEmail, createUser, userPublicFields } from '../_lib/users.js';

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

    // Check if user already exists
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists. Sign in instead.' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await createUser({
      email,
      username: username || email.split('@')[0],
      passwordHash,
    });

    // Create session token
    const publicUser = userPublicFields(user);
    const token = signSession({
      uid: publicUser.uid,
      name: publicUser.name,
      email: publicUser.email,
      avatar: null,
      provider: 'email',
    });

    res.status(201).json({ token, user: publicUser });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
}

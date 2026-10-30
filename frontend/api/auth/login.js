import bcrypt from 'bcryptjs';
import { setCors, signSession } from '../_lib/session.js';
import { findUserByEmail, userPublicFields } from '../_lib/users.js';

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

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create session token
    const publicUser = userPublicFields(user);
    const token = signSession({
      uid: publicUser.uid,
      name: publicUser.name,
      email: publicUser.email,
      avatar: null,
      provider: 'email',
    });

    res.status(200).json({ token, user: publicUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
}

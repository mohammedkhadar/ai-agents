import crypto from 'crypto';
import User from '../models/user.model.js';
import { isDBConnected } from '../db/connect.js';

// --- Password hashing (PBKDF2, built-in crypto — no external deps) ---
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, stored) => {
  try {
    const [salt, hash] = stored.split(':');
    const verify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verify, 'hex'));
  } catch {
    return false;
  }
};

// --- Session token (same HMAC scheme as frontend) ---
const getSecret = () => process.env.AUTH_SECRET || 'dev-insecure-secret-change-me';

const signSession = (payload, days = 30) => {
  const body = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + days * 24 * 60 * 60 * 1000,
  };
  const data = Buffer.from(JSON.stringify(body)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
};

const publicUser = (user) => ({
  uid: user._id.toString(),
  name: user.username || user.email,
  email: user.email,
  avatar: null,
  provider: user.provider || 'email',
});

// In-memory fallback when MongoDB is not configured
const memoryUsers = [];
let nextId = 1;

// Register
export const register = async (req, res) => {
  try {
    const { email, username, password } = req.body || {};

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

    if (!isDBConnected()) {
      const existing = memoryUsers.find(u => u.email === normalizedEmail);
      if (existing) return res.status(409).json({ message: 'An account with this email already exists. Sign in instead.' });
      const user = {
        _id: 'user-' + (nextId++),
        email: normalizedEmail,
        username: (username || email.split('@')[0]).trim(),
        passwordHash: hashPassword(password),
        provider: 'email',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryUsers.push(user);
      const token = signSession(publicUser(user));
      return res.status(201).json({ token, user: publicUser(user) });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists. Sign in instead.' });

    const user = new User({
      email: normalizedEmail,
      username: (username || email.split('@')[0]).trim(),
      passwordHash: hashPassword(password),
      provider: 'email',
    });
    await user.save();

    const token = signSession(publicUser(user));
    res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isDBConnected()) {
      const user = memoryUsers.find(u => u.email === normalizedEmail);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const token = signSession(publicUser(user));
      return res.status(200).json({ token, user: publicUser(user) });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signSession(publicUser(user));
    res.status(200).json({ token, user: publicUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

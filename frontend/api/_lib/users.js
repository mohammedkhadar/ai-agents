import mongoose from 'mongoose';

let cachedConn = null;

export async function connectDB() {
  if (cachedConn) return cachedConn;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI not set — email auth requires a database');
    return null;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    cachedConn = mongoose.connection;
    return cachedConn;
  } catch (e) {
    console.error('MongoDB error:', e.message);
    return null;
  }
}

// Lightweight user schema — uses mongoose if connected, falls back to
// an in-memory store (stateless across cold starts, suitable for local dev)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  provider: { type: String, default: 'email' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// In-memory fallback for when MongoDB is not available
const memoryUsers = [];
let nextId = 1;

export async function findUserByEmail(email) {
  const conn = await connectDB();
  if (!conn) {
    return memoryUsers.find(u => u.email === email.toLowerCase().trim()) || null;
  }
  return await User.findOne({ email: email.toLowerCase().trim() });
}

export async function createUser({ email, username, passwordHash }) {
  const conn = await connectDB();
  if (!conn) {
    const existing = memoryUsers.find(u => u.email === email.toLowerCase().trim());
    if (existing) throw new Error('Email already registered');
    const user = {
      _id: 'user-' + (nextId++),
      email: email.toLowerCase().trim(),
      username: username.trim(),
      passwordHash,
      provider: 'email',
      createdAt: new Date().toISOString(),
    };
    memoryUsers.push(user);
    return user;
  }
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw new Error('Email already registered');
  const user = new User({
    email: email.toLowerCase().trim(),
    username: username.trim(),
    passwordHash,
    provider: 'email',
  });
  return await user.save();
}

export function userPublicFields(user) {
  if (!user) return null;
  const uid = user._id?.toString?.() || user._id;
  return {
    uid,
    name: user.username || user.email,
    email: user.email,
    avatar: null,
    provider: user.provider || 'email',
  };
}

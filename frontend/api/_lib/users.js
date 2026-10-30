import crypto from 'crypto';

// --- Password hashing (PBKDF2, built-in crypto — no external deps) ---
export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

export const verifyUserPassword = (password, stored) => {
  try {
    const [salt, hash] = stored.split(':');
    const verify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verify, 'hex'));
  } catch {
    return false;
  }
};

// --- Session token (same HMAC scheme as session.js) ---
const getSecret = () => process.env.AUTH_SECRET || 'dev-insecure-secret-change-me';

export const signSession = (payload, days = 30) => {
  const body = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + days * 24 * 60 * 60 * 1000,
  };
  const data = Buffer.from(JSON.stringify(body)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
};

// --- Public user fields ---
export const publicUser = (user) => ({
  uid: user._id?.toString?.() || user._id,
  name: user.username || user.email,
  email: user.email,
  avatar: null,
  provider: user.provider || 'email',
});

// In-memory fallback when MongoDB is not configured
const memoryUsers = [];
let nextId = 1;

let UserModel = null;
let cachedConn = null;

async function loadMongoose() {
  if (UserModel) return UserModel;
  if (cachedConn === false) return null; // already tried and failed
  try {
    const mongoose = (await import('mongoose')).default;
    const userSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      username: { type: String, required: true, trim: true },
      passwordHash: { type: String, required: true },
      provider: { type: String, default: 'email' },
    }, { timestamps: true });
    UserModel = mongoose.model('User', userSchema);

    // Try to connect
    if (process.env.MONGODB_URI) {
      try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        cachedConn = mongoose.connection;
      } catch (e) {
        console.error('MongoDB connection error:', e.message);
        cachedConn = null;
      }
    }
  } catch {
    cachedConn = false; // mark as tried
  }
  return UserModel;
}

export async function findUserByEmail(email) {
  const Model = await loadMongoose();
  if (!Model || !cachedConn) {
    return memoryUsers.find(u => u.email === email) || null;
  }
  return await Model.findOne({ email });
}

export async function createUser({ email, username, passwordHash }) {
  const Model = await loadMongoose();
  if (!Model || !cachedConn) {
    const existing = memoryUsers.find(u => u.email === email);
    if (existing) throw new Error('Email already registered');
    const user = {
      _id: 'user-' + (nextId++),
      email,
      username,
      passwordHash,
      provider: 'email',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryUsers.push(user);
    return user;
  }
  const existing = await Model.findOne({ email });
  if (existing) throw new Error('Email already registered');
  const user = new Model({ email, username, passwordHash, provider: 'email' });
  await user.save();
  return user;
}

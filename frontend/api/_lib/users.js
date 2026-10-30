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

// Try to import mongoose (will be available when installed in package.json)
let mongooseModule = null;
let UserModel = null;
let cachedConn = null;
let mongoError = null;

// Attempt mongoose import at module load time
try {
  // Use createRequire for CJS compatibility in Vercel serverless
  const { createRequire } = require('module');
  const req = createRequire(__filename);
  mongooseModule = req('mongoose');
} catch (e) {
  mongoError = e.message;
  // mongoose not available
}

// Mongoose schema/model setup (deferred until first use)
let ModelReady = false;

function setupModel() {
  if (!mongooseModule) return;
  if (ModelReady) return;
  try {
    const userSchema = new mongooseModule.Schema({
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      username: { type: String, required: true, trim: true },
      passwordHash: { type: String, required: true },
      provider: { type: String, default: 'email' },
    }, { timestamps: true });
    UserModel = mongooseModule.model('User', userSchema);
    ModelReady = true;
  } catch (e) {
    mongoError = e.message;
  }
}

// Debug helper
export const getDebugInfo = () => ({
  hasMongoose: !!mongooseModule,
  hasModel: !!UserModel,
  hasConn: !!cachedConn,
  hasMongoUri: !!process.env.MONGODB_URI,
  mongoError: mongoError,
  nextId,
  memoryCount: memoryUsers.length,
});

export async function connectDB() {
  if (!mongooseModule) return null;
  if (cachedConn) return cachedConn;

  setupModel();

  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  try {
    await mongooseModule.connect(uri, { serverSelectionTimeoutMS: 5000 });
    cachedConn = mongooseModule.connection;
    console.log('[auth] MongoDB connected');
    return cachedConn;
  } catch (e) {
    console.error('[auth] MongoDB connection error:', e.message);
    cachedConn = null;
    return null;
  }
}

export async function findUserByEmail(email) {
  const conn = await connectDB();
  if (!conn || !UserModel) {
    return memoryUsers.find(u => u.email === email) || null;
  }
  return await UserModel.findOne({ email });
}

export async function createUser({ email, username, passwordHash }) {
  const conn = await connectDB();
  if (!conn || !UserModel) {
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
  const existing = await UserModel.findOne({ email });
  if (existing) throw new Error('Email already registered');
  const user = new UserModel({ email, username, passwordHash, provider: 'email' });
  await user.save();
  return user;
}

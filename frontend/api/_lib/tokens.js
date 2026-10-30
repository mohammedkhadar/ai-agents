import crypto from 'crypto';
import { setCors } from '../_lib/session.js';

// --- Session token (same HMAC scheme as session.js) ---
const getSecret = () => process.env.AUTH_SECRET || 'dev-insecure-secret-change-me';

export const signToken = (payload, days = 7) => {
  const body = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + days * 24 * 60 * 60 * 1000,
  };
  const data = Buffer.from(JSON.stringify(body)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
};

export const verifyToken = (token) => {
  try {
    const [data, sig] = String(token || '').split('.');
    if (!data || !sig) return null;
    const expected = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};

export const setCorsHeaders = (req, res) => setCors(req, res);

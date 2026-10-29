import crypto from 'crypto';

// Stateless HMAC-signed session tokens (serverless-friendly, no DB needed).
// Set AUTH_SECRET in Vercel env vars for stable tokens across cold starts.

const getSecret = () =>
  process.env.AUTH_SECRET || 'dev-insecure-secret-change-me';

export function signSession(payload, days = 30) {
  const body = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + days * 24 * 60 * 60 * 1000,
  };
  const data = Buffer.from(JSON.stringify(body)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSecret())
    .update(data)
    .digest('base64url');
  return `${data}.${sig}`;
}

export function verifySession(token) {
  try {
    const [data, sig] = String(token || '').split('.');
    if (!data || !sig) return null;
    const expected = crypto
      .createHmac('sha256', getSecret())
      .update(data)
      .digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

export function getBearerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

export function publicUser(payload) {
  if (!payload) return null;
  const { uid, name, email, avatar, provider } = payload;
  return { uid, name, email, avatar, provider };
}

import { setCors } from '../_lib/session.js';

// Minimal env var test endpoint.
export default function handler(req, res) {
  if (setCors(req, res)) return;

  const env = Object.keys(process.env)
    .filter(k => k === 'GOOGLE_CLIENT_ID' || k === 'GITHUB_CLIENT_ID' || k === 'AUTH_SECRET' || k === 'VERCEL' || k === 'UV_THREADPOOL_SIZE')
    .reduce((acc, k) => { acc[k] = process.env[k] ? `[SET len=${process.env[k].length}]` : '[null]'; return acc; }, {});

  res.status(200).json({ env });
}

import { setCors } from '../_lib/session.js';

// Returns the live SSO configuration.
// Client IDs are public and inlined at build time via Vite (VITE_ prefix),
// so the frontend already has them. This endpoint only reports whether
// server-side secrets (GITHUB_CLIENT_SECRET, AUTH_SECRET) are available.

export default function handler(req, res) {
  if (setCors(req, res)) return;

  res.status(200).json({
    google: process.env.GOOGLE_CLIENT_ID || '',
    github: process.env.GITHUB_CLIENT_ID || '',
    hasGithubSecret: !!process.env.GITHUB_CLIENT_SECRET,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    emailPassword: true,
    hasMongoUri: !!process.env.MONGODB_URI,
    _v: '2',
  });
}

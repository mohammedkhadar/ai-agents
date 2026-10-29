import { setCors } from '../_lib/session.js';

// Returns which SSO providers are configured (client IDs are public).
// The frontend uses this to decide which sign-in buttons to enable.

export default function handler(req, res) {
  if (setCors(req, res)) return;

  res.status(200).json({
    google: process.env.GOOGLE_CLIENT_ID || null,
    github: process.env.GITHUB_CLIENT_ID || null,
  });
}

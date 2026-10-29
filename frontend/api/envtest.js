export default function handler(req, res) {
  res.status(200).json({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || null,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || null,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? '[SET]' : null,
    AUTH_SECRET: process.env.AUTH_SECRET ? '[SET]' : null,
    VERCEL: process.env.VERCEL || null,
    NODE_ENV: process.env.NODE_ENV || null,
    all_keys: Object.keys(process.env).sort().slice(0, 50),
  });
}

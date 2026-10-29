export default function handler(req, res) {
  const env = {};
  for (const k of Object.keys(process.env)) {
    if (k.startsWith('VERCEL_') || k.startsWith('GITHUB_') || k.startsWith('GOOGLE_') || k.startsWith('AUTH_') || k.startsWith('OPENAI_')) {
      env[k] = process.env[k] ? '[SET]' : '[null/empty]';
    }
  }
  res.status(200).json(env);
}

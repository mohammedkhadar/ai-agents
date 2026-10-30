import { setCors } from '../_lib/session.js';
import { signToken } from '../_lib/tokens.js';
import { findUserByEmail } from '../_lib/users.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      // Don't reveal whether the email exists — return success either way
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate a password reset token (valid for 1 hour)
    const resetToken = signToken(
      { email: normalizedEmail, purpose: 'password-reset' },
      1 / 24  // 1 hour
    );

    // In production, send email with reset link:
    // await sendEmail(email, `Reset your password: ${resetLink}`)
    // For now, return the token in the response (development/testing only)
    const resetLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://www.opusagents.website'}/reset-password?token=${resetToken}`;

    res.status(200).json({
      message: 'If that email exists, a reset link has been sent.',
      _resetLink: resetLink,  // dev only — remove in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message || 'Error processing request' });
  }
}

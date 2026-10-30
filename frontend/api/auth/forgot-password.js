import { setCors } from '../_lib/session.js';
import { signToken } from '../_lib/tokens.js';
import { findUserByEmail } from '../_lib/users.js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'Opus Agents <password-reset@opusagents.website>';

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

    // Always return success — don't reveal whether the email exists
    const successMsg = { message: 'If that email exists, a reset link has been sent.' };

    if (!user) {
      return res.status(200).json(successMsg);
    }

    // Generate a password reset token (valid for 1 hour)
    const resetToken = signToken(
      { email: normalizedEmail, purpose: 'password-reset' },
      1 / 24  // 1 hour
    );

    const resetLink = `https://www.opusagents.website/login?token=${resetToken}`;

    // Send email via Resend if API key is configured
    if (RESEND_API_KEY) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: RESEND_FROM,
            to: [normalizedEmail],
            subject: 'Your password reset link',
            html: `
              <p>Hello,${user.username ? ' ' + user.username : ''}</p>
              <p>You requested a password reset. Click the link below to set a new password:</p>
              <p><a href="${resetLink}">Reset Your Password</a></p>
              <p>This link expires in 1 hour.</p>
              <p>If you didn't request this, you can safely ignore this email.</p>
            `,
          }),
        });

        if (!emailRes.ok) {
          const err = await emailRes.text();
          console.error('Resend error:', err);
        }
      } catch (emailError) {
        console.error('Email send error:', emailError);
      }
    }

    res.status(200).json(successMsg);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message || 'Error processing request' });
  }
}

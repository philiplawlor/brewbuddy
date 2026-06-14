import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'BrewBuddy <onboarding@resend.dev>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

interface SendPasswordResetEmailParams {
  to: string;
  username: string;
  resetToken: string;
}

export async function sendPasswordResetEmail({
  to,
  username,
  resetToken,
}: SendPasswordResetEmailParams): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

  const { error } = await getResendClient().emails.send(
    {
      from: FROM_EMAIL,
      to: [to],
      subject: 'Reset your BrewBuddy password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #1a1a2e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #f59e0b; font-size: 28px; margin: 0;">🍺 BrewBuddy</h1>
            </div>
            <div style="background-color: #16213e; border-radius: 12px; padding: 32px; border: 1px solid #334155;">
              <h2 style="color: #f8fafc; font-size: 20px; margin: 0 0 16px 0;">Password Reset Request</h2>
              <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Hi ${username},
              </p>
              <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="display: inline-block; background-color: #f59e0b; color: #1a1a2e; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
            <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
              BrewBuddy — Your Brewing Companion
            </p>
          </div>
        </body>
        </html>
      `,
    },
    {
      idempotencyKey: `password-reset/${resetToken}`,
    }
  );

  if (error) {
    console.error('Failed to send password reset email:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

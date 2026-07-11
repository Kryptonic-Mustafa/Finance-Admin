import nodemailer from 'nodemailer';

// Configure nodemailer transport with Gmail SMTP
// Gmail requires an "App Password" to be set up: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || '', // Gmail Email Address
    pass: process.env.SMTP_PASS || '', // Gmail App Password
  },
});

export async function sendPinResetEmail(toEmail: string, resetLink: string) {
  const mailOptions = {
    from: `"Family Finance Admin" <${process.env.SMTP_USER || 'no-reply@finance.local'}>`,
    to: toEmail,
    subject: 'Set / Reset Your Transaction PIN',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Transaction PIN Configuration</h2>
        <p>Hello,</p>
        <p>You requested to set or reset your transaction PIN for your family financial tracking system. This PIN protects your account from unauthorized transaction entries or modifications.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Configure Transaction PIN
          </a>
        </div>
        <p>This link is valid for 1 hour. If you did not request this, please secure your account password immediately.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-t: 1px solid #e0e0e0; padding-top: 10px;">
          Family Finance Admin Platform • Secure Self-Hosted Module
        </p>
      </div>
    `,
  };

  // Fallback log in case the user has not configured SMTP credentials yet
  console.log(`[MAIL SYSTEM] PIN Reset Link generated for ${toEmail}: ${resetLink}`);

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error("Failed to send SMTP email:", error);
      return { success: false, error: "SMTP configuration failed to deliver email. Check server console logs for the link." };
    }
  } else {
    return { 
      success: true, 
      warning: "SMTP credentials not configured in `.env`. The reset link has been printed to the server terminal console." 
    };
  }
}

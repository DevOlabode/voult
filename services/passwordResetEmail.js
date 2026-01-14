const { transporter } = require('../config/mailer');

module.exports.forgottenPasswordEmail = (name, to, resetUrl)=>{
    return transporter.sendMail({
      from : '"AuthWay" <solabode499@gmail.com>',
      to,
      subject : "Reset your AuthWay password",
      html: `
  <div style="font-family: Arial, sans-serif; padding: 20px; background: #f3f4f6;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
      
      <h1 style="color: #111827; margin-top: 0;">
        Reset your AuthWay password 🔐
      </h1>

      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        Hi ${name},
      </p>

      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        We received a request to reset the password for your AuthWay account.
      </p>

      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        Click the button below to choose a new password. This link will expire in <strong>30 minutes</strong>.
      </p>

      <a href="${resetUrl}"
        style="display: inline-block; margin-top: 22px; padding: 14px 22px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
        Reset Password
      </a>

      <p style="margin-top: 28px; font-size: 14px; color: #374151;">
        If you didn’t request this password reset, you can safely ignore this email.
      </p>

      <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">
        For your security, this reset link can only be used once.
      </p>

      <p style="margin-top: 10px; font-size: 14px; color: #6b7280;">
        — The AuthWay Team
      </p>

    </div>
  </div>
`
    });
  }
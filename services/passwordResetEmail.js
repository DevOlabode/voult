module.exports.forgottenPasswordEmail = (to)=>{
    return transporter.sendMail({
      from : '"AuthWay" <solabode499@gmail.com>',
      to,
      subject : "Reset your AuthWay password",
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f3f4f6;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
        
        <h1 style="color: #111827; margin-top: 0;">
          Your AuthWay password was updated 🔐
        </h1>
  
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Hi ${name},
        </p>
  
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          This is a confirmation that your AuthWay account password was successfully changed.
        </p>
  
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          If you made this change, no further action is required.
        </p>
  
        <p style="font-size: 16px; color: #b91c1c; line-height: 1.6;">
          If you did <strong>not</strong> update your password, please secure your account immediately.
        </p>
  
        <a href="https://yourwebsite.com/login"
          style="display: inline-block; margin-top: 22px; padding: 14px 22px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Log in to AuthWay
        </a>
  
        <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">
          For security reasons, this notification is sent whenever your password is changed.
        </p>
  
        <p style="margin-top: 10px; font-size: 14px; color: #6b7280;">
          — The AuthWay Team
        </p>
  
      </div>
    </div>
  `
    });
  }
const { transporter } = require('../config/mailer');

module.exports.welcomeEmail = async(to, name, verifyUrl) =>{
    return transporter.sendMail({
        from : '"AuthWay" <solabode499@gmail.com>',
        to,
        subject : "Welcome to AuthWay",
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f3f4f6;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
            
            <h1 style="color: #111827; margin-top: 0;">
              Welcome to AuthWay, ${name} 👋
            </h1>
      
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Thanks for signing up! Your AuthWay account has been successfully created.
            </p>
      
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Before you get started, please verify your email address to activate your account.
            </p>
      
            <!-- Verify Button -->
            <a href="${verifyUrl}"
              style="display: inline-block; margin-top: 20px; padding: 14px 22px; background: #16a34a; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Verify My Account
            </a>
      
            <p style="margin-top: 26px; font-size: 16px; color: #374151; line-height: 1.6;">
              Once verified, you can:
            </p>
      
            <ul style="font-size: 15px; color: #374151; padding-left: 18px; line-height: 1.6;">
              <li>Manage secure user authentication with Passport.js</li>
              <li>Handle sessions, login states, and protected routes</li>
              <li>Support both web and API-based authentication</li>
              <li>Easily plug AuthWay into your Express applications</li>
            </ul>
      
            <p style="margin-top: 28px; font-size: 14px; color: #6b7280;">
              This verification link expires in <strong>24 hours</strong>.
            </p>
      
            <p style="margin-top: 12px; font-size: 14px; color: #6b7280;">
              If you didn’t create this account, you can safely ignore this email.
            </p>
      
            <p style="margin-top: 10px; font-size: 14px; color: #6b7280;">
              — The AuthWay Team
            </p>
      
          </div>
        </div>
      `
      
    })
};

module.exports.verifyEndUsers = async(to, name, verifyUrl)=>{
  return transporter.sendMail({
    from : `${process.env.EMAIL_FROM}`,
    to,
    html : `
    <p>Welcome to ${app.name}</p>
    <p>Please verify your email:</p>
    <a href="${verifyUrl}">Verify Email</a>
    <p>This link expires in 24 hours.</p>
    `
  })
};
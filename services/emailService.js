const { transporter } = require('../config/email');

module.exports.welcomeEmail = async(to, name) =>{
    return transporter.sendMail({
        from : '"AuthWay" <solabode499@gmail.com>',
        to,
        subject : "Welcome to AuthWay",
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f3f4f6;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
            
            <h1 style="color: #111827; margin-top: 0;">Welcome to AuthWay, ${name} 👋</h1>
      
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Thanks for signing up! Your AuthWay account has been successfully created.
            </p>
      
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              AuthWay helps you build <strong>secure, scalable authentication systems</strong> without the hassle. 
              You can now:
            </p>
      
            <ul style="font-size: 15px; color: #374151; padding-left: 18px; line-height: 1.6;">
              <li> Manage secure user authentication with Passport.js</li>
              <li> Handle sessions, login states, and protected routes</li>
              <li> Support both web and API-based authentication</li>
              <li> Easily plug AuthWay into your Express applications</li>
            </ul>
      
            <a href="https://yourwebsite.com/login"
              style="display: inline-block; margin-top: 22px; padding: 14px 22px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Log In to AuthWay
            </a>
      
            <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">
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
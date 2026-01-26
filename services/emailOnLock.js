const { transporter } = require('../config/mailer');

module.exports.accountLockedEmail = async (
    to,
    name,
    unlockTime,
    supportUrl
  ) => {
    return transporter.sendMail({
      from: '"voult.dev" <solabode499@gmail.com>',
      to,
      subject: 'Your voult.dev account has been temporarily locked',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f3f4f6;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
            
            <h1 style="color: #111827; margin-top: 0;">
              Account Temporarily Locked 
            </h1>
  
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Hi ${name || 'there'},
            </p>
  
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              We detected multiple unsuccessful login attempts on your voult.dev account.
              To keep your account secure, we’ve temporarily locked it.
            </p>
  
            <div style="margin: 20px 0; padding: 16px; background: #fef3c7; border-left: 5px solid #f59e0b; border-radius: 6px;">
              <p style="margin: 0; font-size: 15px; color: #92400e;">
                 <strong>Lock expires at:</strong><br />
                ${new Date(unlockTime).toLocaleString()}
              </p>
            </div>
  
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Once the lock expires, you can try logging in again using your correct credentials.
            </p>
  
            ${
              supportUrl
                ? `
            <a href="${supportUrl}"
              style="display: inline-block; margin-top: 18px; padding: 14px 22px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Contact Support
            </a>
            `
                : ''
            }
  
            <p style="margin-top: 26px; font-size: 14px; color: #6b7280;">
              If this wasn’t you, we strongly recommend resetting your password after regaining access.
            </p>
  
            <p style="margin-top: 10px; font-size: 14px; color: #6b7280;">
              — The voult.dev Security Team
            </p>
  
          </div>
        </div>
      `
    });
  };
  
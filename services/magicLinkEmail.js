const {transporter} = require('../config/mailer');

module.exports.magicLinkEmail = (to, magicLinkURL) => {
    return transporter.sendMail({
      from: '"Voult" <olabodeoluwapelumi838@gmail.com>',
      to,
      subject: "Your secure sign-in link",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Sign in to Voult</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f6f9fc; font-family:Arial, sans-serif;">
          
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr>
              <td align="center">
                
                <!-- Container -->
                <table width="100%" max-width="500px" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:32px;">
                  
                  <!-- Logo / Title -->
                  <tr>
                    <td align="center" style="font-size:22px; font-weight:bold; color:#111;">
                      Voult
                    </td>
                  </tr>
  
                  <!-- Spacer -->
                  <tr><td height="20"></td></tr>
  
                  <!-- Heading -->
                  <tr>
                    <td style="font-size:18px; font-weight:600; color:#111;">
                      Sign in to your account
                    </td>
                  </tr>
  
                  <!-- Spacer -->
                  <tr><td height="10"></td></tr>
  
                  <!-- Body text -->
                  <tr>
                    <td style="font-size:14px; color:#444; line-height:1.6;">
                      Click the button below to securely sign in to your account.
                      This link will expire in 10 minutes.
                    </td>
                  </tr>
  
                  <!-- Spacer -->
                  <tr><td height="24"></td></tr>
  
                  <!-- Button -->
                  <tr>
                    <td align="center">
                      <a href="${magicLinkURL}" 
                         style="
                           display:inline-block;
                           padding:12px 24px;
                           background-color:#4f46e5;
                           color:#ffffff;
                           text-decoration:none;
                           border-radius:6px;
                           font-size:14px;
                           font-weight:600;
                         ">
                        Sign in to Voult
                      </a>
                    </td>
                  </tr>
  
                  <!-- Spacer -->
                  <tr><td height="24"></td></tr>
  
                  <!-- Fallback link -->
                  <tr>
                    <td style="font-size:12px; color:#666; line-height:1.5;">
                      If the button doesn’t work, copy and paste this link into your browser:
                      <br />
                      <a href="${magicLinkURL}" style="color:#4f46e5; word-break:break-all;">
                        ${magicLinkURL}
                      </a>
                    </td>
                  </tr>
  
                  <!-- Spacer -->
                  <tr><td height="24"></td></tr>
  
                  <!-- Footer -->
                  <tr>
                    <td style="font-size:12px; color:#999; text-align:center;">
                      If you did not request this, you can safely ignore this email.
                    </td>
                  </tr>
  
                </table>
  
              </td>
            </tr>
          </table>
  
        </body>
        </html>
      `
    });
  };
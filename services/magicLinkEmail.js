const { transporter } = require('../config/mailer');

module.exports.magicLinkEmail = (to, magicLinkURL) =>{
    return transporter.sendMail({
        from : '"voult.dev" <solabode499@gmail.com>',
        to,
        subject : "Reset your voult.dev password",
        html : `
        `
    })
}
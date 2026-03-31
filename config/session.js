const isProduction = process.env.NODE_ENV === 'production';

const sessionConfig = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
    //    secure : true,
        secure: isProduction && (req.secure || req.headers['x-forwarded-proto'] === 'https'),
        httpOnly: true,
        sameSite: 'lax',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
};

module.exports = sessionConfig;

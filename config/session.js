const isProduction = process.env.NODE_ENV === 'production';

const sessionConfig = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: isProduction, // Only use secure cookies in production (HTTPS)
        httpOnly: true,
        sameSite: 'lax', // Add CSRF protection
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
};

module.exports = sessionConfig;

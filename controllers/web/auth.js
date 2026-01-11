const User = require('../../models/user');

const passport = require('passport');

const {welcomeEmail} = require('../../services/emailService');

const crypto = require('crypto');

module.exports.loginForm = (req, res)=>{
    res.render('auth/login', {title : "Login Page"})
};

module.exports.login = async (req, res) => {
    req.user.lastLoginAt = new Date();
    await req.user.save();

    req.flash('success', 'Welcome back');
    const returnUrl = res.locals.returnTo || '/';
    res.redirect(returnUrl);
};

module.exports.registerForm = (req, res)=>{
    res.render('auth/register', {title : 'Register Form'});
};

module.exports.register =  async (req, res) => {
    try {
      const { email, name, password } = req.body;
  
      if (!email || !name || !password) {
        req.flash('error', 'All fields are required');
        return res.redirect('/register');
      };

      const verifyToken = crypto.randomBytes(32).toString('hex');

      const user = new User({
        name,
        email,
        verifyToken,
        verifyTokenExpires: Date.now() + 1000 * 60 * 60 * 24 // 24h
      });

      const verifyUrl = `${
        process.env.NODE_ENV === 'production' ? 'https' : 'http'
      }://${req.headers.host}/verify/${verifyToken}`;
  
      await User.register(user, password);
  
      user.generateApiKey();
      await user.save();

      await welcomeEmail(user.email, user.name, verifyUrl);
  
      req.login(user, err => {
        if (err) throw err;
        req.flash('success', 'Account created successfully');
        res.redirect('/');
      });
  
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/register');
    }
  };

module.exports.logout = (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }

    req.flash('success', 'You have logged out successfully');
    res.redirect('/');
  });
};

module.exports.verifyAccount = async (req, res) => {
  const user = await User.findOne({
    verifyToken: req.params.token,
    verifyTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'Verification link is invalid or expired.');
    return res.redirect('/login');
  }

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpires = undefined;

  await user.save();

  req.flash('success', 'Your account has been verified. You can now log in.');
  res.redirect('/login');
};
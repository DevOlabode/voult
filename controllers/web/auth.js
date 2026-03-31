const User = require('../../models/developer');
const passport = require('passport');
const { welcomeEmail } = require('../../services/emailService');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Custom authentication function to handle both user not found and wrong password consistently
const customAuthenticate = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    // User doesn't exist - return consistent error message
    throw new Error('Invalid credentials. Please try again.');
  }
  
  // User exists, verify password using the instance method correctly
  // passport-local-mongoose's authenticate method returns an object with 'error' property if failed
  const { error } = await user.authenticate(password);
  if (error) {
    // Password is incorrect - return consistent error message
    throw new Error('Invalid credentials. Please try again.');
  }
  
  return user;
};

// const customAuthenticate = async (email, password) => {
//   const user = await User.findOne({ email });

//   if (!user) {
//     throw new Error('Invalid credentials');
//   }

//   const isMatch = await bcrypt.compare(password, user.password);

//   if (!isMatch) {
//     throw new Error('Invalid credentials');
//   }

//   return user;
// };

const baseUrl = () => (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

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
      const { email, name, password, username } = req.body;
  
      if (!email || !name || !password) {
        req.flash('error', 'All fields are required');
        return res.redirect('/register');
      };

      const verifyToken = crypto.randomBytes(32).toString('hex');

      const user = new User({
        name,
        email,
        username,
        verifyToken,
        verifyTokenExpires: Date.now() + 1000 * 60 * 60 * 24 // 24h
      });


      const verifyUrl = `${process.env.BASE_URL}/verify/${verifyToken}`
  
      await User.register(user, password);
  
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

// ---- Link OAuth providers to developer account (must be logged in) ----

module.exports.startLinkGoogle = (req, res, next) => {
  req.session.linkingUserId = req.user._id.toString();
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    callbackURL: baseUrl() + '/auth/google/link/callback',
  })(req, res, next);
};

module.exports.googleLinkCallback = (req, res, next) => {
  const targetId = req.session.linkingUserId;
  if (targetId) delete req.session.linkingUserId;

  passport.authenticate('google', {
    callbackURL: baseUrl() + '/auth/google/link/callback',
    failureRedirect: '/settings',
  }, async (err, user, info) => {
    if (err) {
      req.flash('error', 'Could not link Google account.');
      return res.redirect('/settings');
    }
    if (!user) {
      req.flash('error', 'Google sign-in was cancelled or failed.');
      return res.redirect('/settings');
    }
    if (!targetId) {
      req.flash('error', 'Link session expired. Please try again.');
      return res.redirect('/settings');
    }

    const target = await User.findById(targetId);
    if (!target) {
      req.flash('error', 'Account not found.');
      return res.redirect('/settings');
    }

    target.googleId = user.googleId;
    if (!target.avatar && user.avatar) target.avatar = user.avatar;
    await target.save();

    if (user._id.toString() !== targetId) {
      await User.findByIdAndUpdate(user._id, { $unset: { googleId: 1 } });
      req.login(target, (loginErr) => {
        if (loginErr) return next(loginErr);
        req.flash('success', 'Google account linked.');
        res.redirect('/settings');
      });
    } else {
      req.flash('success', 'Google account linked.');
      res.redirect('/settings');
    }
  })(req, res, next);
};

module.exports.startLinkGithub = (req, res, next) => {
  req.session.linkingUserId = req.user._id.toString();
  passport.authenticate('github', {
    scope: ['user:email'],
    callbackURL: baseUrl() + '/auth/github/link/callback',
  })(req, res, next);
};

module.exports.githubLinkCallback = (req, res, next) => {
  const targetId = req.session.linkingUserId;
  if (targetId) delete req.session.linkingUserId;

  passport.authenticate('github', {
    callbackURL: baseUrl() + '/auth/github/link/callback',
    failureRedirect: '/settings',
  }, async (err, user, info) => {
    if (err) {
      req.flash('error', 'Could not link GitHub account.');
      return res.redirect('/settings');
    }
    if (!user) {
      req.flash('error', 'GitHub sign-in was cancelled or failed.');
      return res.redirect('/settings');
    }
    if (!targetId) {
      req.flash('error', 'Link session expired. Please try again.');
      return res.redirect('/settings');
    }

    const target = await User.findById(targetId);
    if (!target) {
      req.flash('error', 'Account not found.');
      return res.redirect('/settings');
    }

    target.githubId = user.githubId;
    if (!target.avatar && user.avatar) target.avatar = user.avatar;
    await target.save();

    if (user._id.toString() !== targetId) {
      await User.findByIdAndUpdate(user._id, { $unset: { githubId: 1 } });
      req.login(target, (loginErr) => {
        if (loginErr) return next(loginErr);
        req.flash('success', 'GitHub account linked.');
        res.redirect('/settings');
      });
    } else {
      req.flash('success', 'GitHub account linked.');
      res.redirect('/settings');
    }
  })(req, res, next);
};
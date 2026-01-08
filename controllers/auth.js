const User = require('../models/user');

const passport = require('passport');

module.exports.loginForm = (req, res)=>{
    res.render('auth/login', {title : "Login Page"})
};

module.exports.login = async (req, res) => {
    req.user.lastLoginAt = new Date();
    await req.user.save();

    req.flash('success', 'Welcome back');
    res.redirect('/dashboard');
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
      }
  
      const user = new User({ email, name });
  
      // passport-local-mongoose handles hashing
      await User.register(user, password);
  
      // Generate API key after successful registration
      user.generateApiKey();
      await user.save();
  
      // Auto-login after register
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
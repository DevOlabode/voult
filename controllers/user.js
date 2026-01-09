const User = require('../models/user');

const crypto = require('crypto');

module.exports.dashboard = async(req, res)=>{
    const user = await User.findById(req.user._id);
    res.render('user/dashboard', {user, title : 'Dashboard'})
};

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
};

module.exports.forgotPasswordForm = async(req, res)=>{
    res.render('forgottenPassword/forgot-password')
};

module.exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    const user = await User.findOne({ email });
  
    // Prevent email enumeration
    if (!user) {
      req.flash('success', 'If an account exists, a reset link has been sent.');
      return res.redirect('/forgot-password');
    }
  
    const token = generateResetToken();
  
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 minutes
    await user.save();
  
    const resetUrl = `https://localhost:3000/reset-password/${token}`;

    const forgottenPasswordEmail = require('../services/passwordResetEmail');

    await forgottenPasswordEmail(email);
  
    req.flash('success', 'A reset link has been sent to your email.');
    res.redirect('/forgot-password');
  };

  module.exports.resetPasswordForm = async (req, res) => {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
  
    if (!user) {
      req.flash('error', 'Password reset token is invalid or expired');
      return res.redirect('/forgot-password');
    }
  
    res.render('forgottenPassword/reset-password', {
      token: req.params.token,
    });
  };


  module.exports.resetPassword = async (req, res) => {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/reset-password');
    };

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
  
    if (!user) {
      req.flash('error', 'Password reset token is invalid or expired');
      return res.redirect('/forgot-password');
    }
  
    await user.setPassword(password);
  
    // Cleanup
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  
    req.flash('success', 'Password updated. You can now log in.');
    res.redirect('/login');
  }
  
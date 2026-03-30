const User = require('../../models/developer');
const App = require('../../models/app');

const crypto = require('crypto');
const bcrypt = require('bcrypt');

module.exports.dashboard = async (req, res) => {
  // Simple overview; detailed app management lives on /apps
  const appsCount = await App.countDocuments({
    owner: req.user._id,
    deletedAt: { $exists: false },
  });

  res.render('user/dashboard', {
    title: 'Dashboard',
    user: req.user,
    appsCount,
  });
};

module.exports.appsPage = async (req, res) => {
  const apps = await App.find({
    owner: req.user._id,
    deletedAt: { $exists: false },
  }).sort({ createdAt: -1 });

  res.render('user/apps', {
    title: 'Apps | voult.dev',
    user: req.user,
    apps,
  });
};

module.exports.profilePage = async (req, res) => {
  res.render('user/profile', {
    title: 'Profile | voult.dev',
    user: req.user,
  });
};

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
};

// Enter Email Form.
module.exports.forgotPasswordForm = async(req, res)=>{
    res.render('forgottenPassword/forgot-password', {title : 'Forgot Password'})
};

// Send Email to user email
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
  
    const resetUrl = `${process.env.BASE_URL}/reset-password/${token}`;

    const {forgottenPasswordEmail} = require('../../services/passwordResetEmail');

    await forgottenPasswordEmail(user.name, email, resetUrl);
  
    req.flash('success', `A reset link has been sent to your email. Did not see it? <a href="/forgot-password">Resend email</a>`);
    res.redirect('/login');
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
      title : 'Reset Password',
      token: req.params.token,
    });
  };

  module.exports.resetPassword = async(req, res)=>{
    try {
      const { password, confirmPassword } = req.body;

      // Check if passwords match
      if(password !== confirmPassword){
        req.flash('error', 'New Password and confirm password should be the same');
        return res.redirect(`/reset-password/${req.params.token}`);
      }

      // Find user with valid token
      const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        req.flash('error', 'Password reset token is invalid or expired');
        return res.redirect('/forgot-password');
      }

      //Set Password
      await user.setPassword(confirmPassword);

      // Clear reset token fields (security)
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      
      // Save updated user
      await user.save();
      
      req.flash('success', 'Password changed successfully. You can login with your new passwords');
      res.redirect('/login');
      
    } catch (error) {
      console.error('Password reset error:', error);
      req.flash('error', 'An error occurred while resetting your password. Please try again.');
      res.redirect(`/reset-password/${req.params.token}`);
    }
  };

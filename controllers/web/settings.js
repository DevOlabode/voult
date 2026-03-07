const User = require('../../models/developer');
const App = require('../../models/app');

  // Developer Settings Page.
  module.exports.settingsPage = (req, res) =>{
    const user = req.user;
    res.render('user/settings', {title : 'Settings', user})
  };

  module.exports.deleteAccountForm = async(req, res)=>{
    const user = await User.findById(req.user._id);

    if(!user){
      req.flash('error', 'User Not Found!');
      res.redirect('/dashboard');
    };

    res.render('user/enterPassword', {title : 'Enter Password To Delete Account'})
  };

  module.exports.deleteAccount = async (req, res, next) => {
    try {
      const { password } = req.body;
  
      const user = await User.findById(req.user._id);
  
      if (!user) {
        req.flash('error', 'User does not exist');
        return res.redirect('/dashboard');
      }
  
      const { error } = await user.authenticate(password);
  
      if (error) {
        req.flash('error', 'Incorrect password');
        return res.redirect('/dashboard');
      }
  
      req.logout(async err => {
        if (err) return next(err);

        await App.deleteMany({ owner: user._id });
        await User.findByIdAndDelete(user._id);

        req.flash('success', 'Account deleted successfully');
        res.redirect('/');
      });
  
    } catch (err) {
      next(err);
    }
};

module.exports.resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  if (password !== confirmPassword) {
    req.flash('error', 'Passwords do not match');
    return res.redirect(`/reset-password/${token}`);
  };

  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.flash('error', 'Password reset token is invalid or expired');
    return res.redirect('/forgot-password');
  };

  await user.setPassword(password);

  // Cleanup
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  req.flash('success', 'Password updated. You can now log in.');
  res.redirect('/login');
};
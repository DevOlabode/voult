const OAuthAccount = require('../../models/OAuthAccount');
const User = require('../../models/EndUser');
const bcrypt = require('bcrypt');
const generateProviderAuthUrl = require('../../services/oauth/generateProviderAuthUrl')


// 🔹 Start Linking Flow
exports.startLinking = async (req, res) => {
  const { provider } = req.params;
  const user = req.endUser;

  const state = {
    intent: 'link',
    userId: user._id.toString()
  };
  const app = user.app;
  const redirectUrl = generateProviderAuthUrl(provider, state, app);

  return res.json({ redirectUrl });
};

// 🔹 Get Linked Providers
exports.getLinkedProviders = async (req, res) => {
  const accounts = await OAuthAccount.find({
    userId: req.endUser._id
  }).select('provider createdAt');

  return res.json({
    providers: accounts
  });
};


// 🔹 Unlink Provider
exports.unlinkProvider = async (req, res) => {
  const { provider } = req.params;
  const user = req.endUser;

  const oauthCount = await OAuthAccount.countDocuments({
    userId: user._id
  });

  const hasPassword = !!user.passwordHash;

  if (!hasPassword && oauthCount <= 1) {
    return res.status(400).json({
      error: 'NO_AUTH_METHOD_LEFT'
    });
  }

  await OAuthAccount.deleteOne({
    userId: user._id,
    provider
  });

  return res.json({ success: true });
};


// 🔹 Set Password (for social-only accounts)
exports.setPassword = async (req, res) => {
  const { password } = req.body;
  const user = req.endUser;

  if (user.passwordHash) {
    return res.status(400).json({
      error: 'PASSWORD_ALREADY_SET'
    });
  }

  const hash = await bcrypt.hash(password, 12);

  user.passwordHash = hash;
  await user.save();

  return res.json({ success: true });
};
const EndUser = require('../../models/endUser');
const App = require('../../models/app');
const { ApiError } = require('../../utils/apiError');
const { signAccessToken } = require('../../utils/jwt');
const { createRefreshToken } = require('../../utils/refreshToken');
const { getFacebookProfile } = require('../../utils/facebookOAuth');
const { welcomeOAuthUser } = require('../../services/emailService');

module.exports.facebookRegister = async (req, res) => {
  const { accessToken } = req.body;
  const app = req.appClient;

  if (!accessToken) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'accessToken is required');
  };

  console.log("Facebook Access Token", accessToken);

  if (!app.facebookOAuth?.enabled) {
    throw new ApiError(
      400,
      'FACEBOOK_NOT_ENABLED',
      'Facebook OAuth not enabled'
    );
  }

  const { facebookId, email, fullName } = await getFacebookProfile(accessToken);

  const existingUser = await EndUser.findOne({
    app: app._id,
    email,
    deletedAt: null
  });

  if (existingUser) {
    throw new ApiError(
      409,
      'USER_EXISTS',
      'An account with this email already exists'
    );
  }

  const user = await EndUser.create({
    app: app._id,
    email,
    fullName, // may be null
    facebookId,
    authProvider: 'facebook',
    isEmailVerified: true,
    isActive: true,
    lastLoginAt: new Date()
  });

  await App.updateOne(
    { _id: app._id },
    { $inc: { 'usage.totalRegistrations': 1 } }
  );

  await welcomeOAuthUser({
    to: email,
    name: fullName,
    appName: app.name,
    provider: 'Facebook'
  });

  const accessJwt = signAccessToken(user, app);
  const { rawToken: refreshToken } = await createRefreshToken({
    endUser: user,
    app,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.status(201).json({
    message: 'Facebook registration successful',
    accessToken: accessJwt,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName
    }
  });
};


module.exports.facebookLogin = async (req, res) => {
    const { accessToken } = req.body;
    const app = req.appClient;
  
    if (!accessToken) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'accessToken is required');
    }
  
    const { facebookId, email } =
      await getFacebookProfile(accessToken);
  
    const user = await EndUser.findOne({
      app: app._id,
      email,
      deletedAt: null
    });
  
    if (!user) {
      throw new ApiError(
        404,
        'USER_NOT_FOUND',
        'No account found for this email'
      );
    }
  
    if (!user.facebookId) {
      user.facebookId = facebookId;
      user.authProvider = 'facebook';
      user.isEmailVerified = true;
    }
  
    if (!user.isActive) {
      throw new ApiError(
        403,
        'ACCOUNT_DISABLED',
        'Account is disabled'
      );
    }
  
    user.lastLoginAt = new Date();
    await user.save();
  
    const accessJwt = signAccessToken(user, app);
    const { rawToken: refreshToken } = await createRefreshToken({
      endUser: user,
      app,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
  
    res.json({
      message: 'Facebook login successful',
      accessToken: accessJwt,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName
      }
    });
  };
  


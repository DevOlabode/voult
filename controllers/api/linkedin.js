const EndUser = require('../../models/EndUser');
const App = require('../../models/app');
const { ApiError } = require('../../utils/apiError');
const { signAccessToken } = require('../../utils/jwt');
const { createRefreshToken } = require('../../utils/refreshToken');
const {
  exchangeCodeForToken,
  getLinkedInProfile
} = require('../../utils/linkedinOAuth');
const { welcomeOAuthUser } = require('../../services/emailService');

module.exports.linkedinRegister = async (req, res) => {
  const { code } = req.body;
  const app = req.appClient;

  if (!code) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'code is required');
  }

  if (!app.linkedinOAuth?.enabled) {
    throw new ApiError(
      400,
      'LINKEDIN_NOT_ENABLED',
      'LinkedIn OAuth not enabled'
    );
  }

  const accessToken = await exchangeCodeForToken({
    code,
    clientId: app.linkedinOAuth.clientId,
    clientSecret: app.linkedinOAuth.clientSecret,
    redirectUri: app.linkedinOAuth.redirectUri
  });

  const { linkedinId, email, fullName } =
    await getLinkedInProfile(accessToken);

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
    fullName,
    linkedinId,
    authProvider: 'linkedin',
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
    provider: 'LinkedIn'
  });

  const accessJwt = signAccessToken(user, app);
  const { rawToken: refreshToken } = await createRefreshToken({
    endUser: user,
    app,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.status(201).json({
    message: 'LinkedIn registration successful',
    accessToken: accessJwt,
    refreshToken,
    user: {
      id: user._id,
      email,
      fullName
    }
  });
};



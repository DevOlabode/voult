const EndUser = require('../../models/EndUser');
const { ApiError } = require('../../utils/apiError');
const { signAccessToken } = require('../../utils/jwt');
const { createRefreshToken } = require('../../utils/refreshToken');
const { OAuth2Client } = require('google-auth-library');

const {verifyEndUsers} = require('../../services/emailService');
const App = require('../../models/app');

module.exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;
  const app = req.appClient;

  if (!idToken) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'idToken is required');
  }

  if (!app.googleOAuth?.clientId) {
    throw new ApiError(
      400,
      'GOOGLE_NOT_CONFIGURED',
      'Google login not enabled'
    );
  }

  /* -------- Verify Google ID token -------- */
  const client = new OAuth2Client(app.googleOAuth.clientId);

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: app.googleOAuth.clientId
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw new ApiError(401, 'INVALID_GOOGLE_TOKEN', 'Invalid Google ID token');
  }

  const {
    sub: googleId,
    email,
    email_verified,
    name
  } = payload;

  if (!email_verified) {
    throw new ApiError(403, 'EMAIL_NOT_VERIFIED', 'Google email not verified');
  }

  /* -------- Find existing user -------- */
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

  if (!user.isActive) {
    throw new ApiError(403, 'ACCOUNT_DISABLED', 'Account is disabled');
  }

  /* -------- Link Google if not linked -------- */
  if (!user.googleId) {
    user.googleId = googleId;
    user.authProvider = 'google';
    user.isEmailVerified = true;
  }

  user.lastLoginAt = new Date();
  await user.save();

  /* Verify End User Email */
  const appO = await App.findById(app._id);

  const userPerApp = await EndUser.countDocuments({app : appO._id});
  appO.usage.totalRegistrations = userPerApp;

  await appO.save();

  await user.save();

  const verifyToken = await user.generateEmailVerificationToken();

  const verifyUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${verifyToken}&appId=${app._id}`;

  const token = signEndUserToken(user, app);

  await verifyEndUsers(
    user.email,
    app.name,
    verifyUrl,
  );

  /* -------- Issue tokens -------- */
  const accessToken = signAccessToken(user, app);

  const { rawToken: refreshToken } = await createRefreshToken({
    endUser: user,
    app,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.status(200).json({
    message: 'Google login successful',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email
    }
  });
};

module.exports.googleRegister = async (req, res) => {
  const { idToken } = req.body;
  const app = req.appClient;

  if (!idToken) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'idToken is required');
  }

  if (!app.googleOAuth?.clientId) {
    throw new ApiError(
      400,
      'GOOGLE_NOT_CONFIGURED',
      'Google OAuth not enabled'
    );
  }

  /* -------- Verify Google ID token -------- */
  const client = new OAuth2Client(app.googleOAuth.clientId);

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: app.googleOAuth.clientId
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw new ApiError(401, 'INVALID_GOOGLE_TOKEN', 'Invalid Google ID token');
  }

  const {
    sub: googleId,
    email,
    email_verified,
    name
  } = payload;

  if (!email_verified) {
    throw new ApiError(403, 'EMAIL_NOT_VERIFIED', 'Google email not verified');
  }

  /* -------- Prevent duplicates -------- */
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

  /* -------- Create user -------- */
  const user = await EndUser.create({
    app: app._id,
    email,
    fullName: name,
    googleId,
    authProvider: 'google',
    isEmailVerified: true,
    isActive: true,
    lastLoginAt: new Date()
  });

  await App.updateOne(
    { _id: app._id },
    { $inc: { 'usage.totalRegistrations': 1 } }
  );

  /* -------- Issue tokens -------- */
  const accessToken = signAccessToken(user, app);

  const { rawToken: refreshToken } = await createRefreshToken({
    endUser: user,
    app,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.status(201).json({
    message: 'Google registration successful',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email
    }
  });
};

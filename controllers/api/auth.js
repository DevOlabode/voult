const EndUser = require('../../models/endUser');
const { signEndUserToken } = require('../../utils/jwt');
const { ApiError } = require('../../utils/apiError');
const App = require('../../models/app');

const crypto = require('crypto');

// EMAILS
const {verifyEndUsers, sendPasswordResetEmail} = require('../../services/emailService');


// TOKENS
const RefreshToken = require('../../models/refreshToken');
const { signAccessToken, signRefreshToken } = require('../../utils/jwt');
const { createRefreshToken } = require('../../utils/refreshToken')


// PASSWORDS RULES
const { validatePassword } = require('../../validators/password');
const { PASSWORD_RULES_MESSAGE } = require('../../constants/passwordRules');

// =======================
// REGISTER
// =======================
module.exports.register = async (req, res) => {
  const { email, password } = req.body;
  const app = req.appClient;

  if (!email || !password) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'Email and password are required'
    );
  }

  const existingUser = await EndUser.findOne({
    app: app._id,
    email
  });

  if (existingUser) {
    throw new ApiError(
      409,
      'USER_EXISTS',
      'User with that email already exists'
    );
  };

  if (!validatePassword(password)) {
    throw new ApiError(
      400,
      'WEAK_PASSWORD',
      PASSWORD_RULES_MESSAGE
    );
  }
  

  const user = new EndUser({
    app: app._id,
    email
  });

  await user.setPassword(password);

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

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: user._id,
      email: user.email
    }
  });
};


const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

// =======================
// LOGIN
// =======================
module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  const app = req.appClient;

  if (!email || !password) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'Email and password are required'
    );
  }

  const user = await EndUser.findOne({
    app: app._id,
    email,
    deletedAt: null,
  }).select('+passwordHash');

  if (!user) {
    throw new ApiError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password'
    );
  }

  //  Account lock check
  if (user.lockUntil && user.lockUntil > Date.now()) {
    throw new ApiError(
      423,
      'ACCOUNT_LOCKED',
      'Too many failed login attempts. Try again later.'
    );
  }

  const isValid = await user.verifyPassword(password);

  //  Invalid password
  if (!isValid) {
    user.failedLoginAttempts += 1;

    // Lock account if max attempts reached
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME);
    }

    await user.save();

    throw new ApiError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password'
    );
  }

  // ✅ Successful login → reset lock state
  user.failedLoginAttempts = 0;
  user.lockUntil = null;

  if (!user.isEmailVerified) {
    throw new ApiError(
      403,
      'EMAIL_NOT_VERIFIED',
      'Please verify your email before logging in'
    );
  }

  if (!user.isActive) {
    throw new ApiError(
      403,
      'ACCOUNT_DISABLED',
      'Account is disabled'
    );
  }

  // Update login metadata
  user.lastLoginAt = new Date();
  await user.save();

  // App usage tracking
  const appO = await App.findById(app._id);
  appO.usage.totalLogins += 1;
  await appO.save();

  // Issue tokens
  const accessToken = signAccessToken(user, app);

  const { rawToken: refreshToken } = await createRefreshToken({
    endUser: user,
    app,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json({
    message: 'Login successful',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
    },
  });
};

// =======================
// LOGOUT
// =======================
module.exports.logout = async (req, res) => {
  if (!req.endUser) {
    throw new ApiError(
      401,
      'UNAUTHORIZED',
      'Authentication required'
    );
  }
  
  // Revoke ALL refresh tokens for this user + app
  await RefreshToken.updateMany(
    {
      endUser: req.endUser._id,
      app: req.appClient._id,
      revokedAt: null,
    },
    {
      revokedAt: new Date(),
    }
  );

  // Optional hard logout (kills any still-valid access tokens)
  req.endUser.tokenVersion += 1;
  await req.endUser.save();

  res.status(200).json({
    message: 'Logged out successfully',
  });
};
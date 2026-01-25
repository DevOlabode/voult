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
const endUser = require('../../models/endUser');


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

  const isValid = await user.verifyPassword(password);
  if (!isValid) {
    throw new ApiError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password'
    );
  }

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

  //  Issue tokens
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


// Refresh

module.exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  const app = req.appClient;

  if (!refreshToken) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Refresh token required');
  }

  const tokenHash = RefreshToken.hashToken(refreshToken);

  const storedToken = await RefreshToken.findOne({
    tokenHash,
  }).populate('endUser');

  //  Token not found
  if (!storedToken) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Invalid refresh token');
  }

  // 🚨 REUSE DETECTION
  if (storedToken.revokedAt) {
    // Someone reused an already-rotated token
    await RefreshToken.updateMany(
      {
        endUser: storedToken.endUser._id,
        app: storedToken.app,
        revokedAt: null,
      },
      { revokedAt: new Date() }
    );

    throw new ApiError(
      401,
      'REFRESH_TOKEN_REUSE_DETECTED',
      'Session compromised. Please log in again.'
    );
  }

  //  Expired
  if (storedToken.expiresAt < new Date()) {
    throw new ApiError(
      401,
      'REFRESH_TOKEN_EXPIRED',
      'Refresh token expired'
    );
  }

  //  ROTATION
  storedToken.revokedAt = new Date();

  const { rawToken: newRefreshToken } = await createRefreshToken({
    endUser: storedToken.endUser,
    app,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  storedToken.replacedByTokenHash =
    RefreshToken.hashToken(newRefreshToken);

  storedToken.lastUsedAt = new Date();  

  await storedToken.save();

  const accessToken = signAccessToken(
    storedToken.endUser,
    app
  );

  res.json({
    accessToken,
    refreshToken: newRefreshToken,
  });
};



// =======================
// ME
// =======================
module.exports.me = async (req, res) => {
  const user = await req.endUser.populate('app');

  if (!req.endUser) {
    throw new ApiError(
      401,
      'UNAUTHORIZED',
      'Authentication required'
    );
  }

  if (!user.isEmailVerified) {
    throw new ApiError(
      403,
      'EMAIL_NOT_VERIFIED',
      'Please verify your email before logging in'
    );
  }
  
  res.status(200).json({
    id: user._id,
    email: user.email,
    createdAt: user.createdAt,
    app: user.app
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


// verify Email.
module.exports.verifyEmail = async (req, res) => {
  const { token, appId } = req.query;

  if (!token || !appId) {
    throw new ApiError(
      400,
      'INVALID_VERIFICATION_LINK',
      'Invalid verification link'
    );
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await EndUser.findOne({
    app: appId,
    isEmailVerified : false,
    emailVerificationToken : hashedToken
  });

  if (!user) {
    throw new ApiError(
      400,
      'TOKEN_EXPIRED',
      'Verification link is invalid or expired'
    );
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save();

  res.status(200).json({
    message: 'Email verified successfully'
  });
};

/* Forgotten Password */

module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const app = req.appClient;

  if (!email) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'Email is required'
    );
  }

  const user = await EndUser.findOne({
    app: app._id,
    email,
    isEmailVerified: true
  });

  if (!user) {
    return res.status(200).json({
      message: 'Email Not Found'
    });
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save();

  const resetUrl = `${process.env.BASE_URL}/api/auth/reset-password?token=${resetToken}&appId=${app._id}`;

  await sendPasswordResetEmail(
    user.email,
    app.name,
    resetUrl
  );

  res.status(200).json({
    message: 'If that email exists, a reset link has been sent'
  });
};

/* Reset Password */
module.exports.resetPassword = async (req, res) => {
  const {  password } = req.body;
  const {token, appId} = req.query

  if (!token || !appId || !password) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'Token, appId and password are required'
    );
  };

  if (!validatePassword(password)) {
    throw new ApiError(
      400,
      'WEAK_PASSWORD',
      PASSWORD_RULES_MESSAGE
    );
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await EndUser.findOne({
    app: appId,
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  }).select('+passwordHash');

  if (!user) {
    throw new ApiError(
      400,
      'INVALID_TOKEN',
      'Reset token is invalid or expired'
    );
  }

  await user.setPassword(password);

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.tokenVersion += 1; 

  await user.save();

  res.status(200).json({
    message: 'Password reset successful'
  });
};


// Disable Account.

module.exports.disableAccount = async (req, res) => {
  const user = req.endUser;

  if (!user.isActive) {
    throw new ApiError(
      400,
      'ACCOUNT_ALREADY_DISABLED',
      'Account is already disabled'
    );
  }

  user.isActive = false;
  user.disabledAt = new Date();
  user.disabledReason = 'User requested';

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Account disabled successfully'
  });
};


// =======================
// RE-ENABLE ACCOUNT
// =======================
module.exports.reenableAccount = async (req, res) => {
  const user = req.endUser;

  if (user.isActive) {
    throw new ApiError(
      400,
      'ACCOUNT_ALREADY_ACTIVE',
      'Account is already active'
    );
  }

  user.isActive = true;
  user.disabledAt = null;
  user.disabledReason = null;

  // Force re-login everywhere
  user.tokenVersion += 1;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Account re-enabled successfully. Please log in again.'
  });
};
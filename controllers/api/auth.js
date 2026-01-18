const EndUser = require('../../models/endUser');
const { signEndUserToken } = require('../../utils/jwt');
const { ApiError } = require('../../utils/apiError');
const App = require('../../models/app');

const crypto = require('crypto');

const {verifyEndUsers} = require('../../services/emailService');


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
  }

  const user = new EndUser({
    app: app._id,
    email
  });

  await user.setPassword(password);

  const appO = await App.findById(app._id);
  appO.usage.totalRegistrations += 1;

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
    deletedAt: null
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
  };

  if (!user.isEmailVerified) {
    throw new ApiError(
      403,
      'EMAIL_NOT_VERIFIED',
      'Please verify your email before logging in'
    );
  }
  

  user.lastLoginAt = new Date();

  const appO = await App.findById(app._id);
  appO.usage.totalLogins += 1;

  await appO.save();

  await user.save();

  const token = signEndUserToken(user, app);

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      email: user.email
    }
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

  req.endUser.tokenVersion += 1;
  await req.endUser.save();

  res.status(200).json({
    message: 'Logged out successfully'
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

  console.log('The User', user);

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

const EndUser = require('../../models/endUser');
const { signEndUserToken } = require('../../utils/jwt');
const { ApiError } = require('../../utils/apiError');


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

  app.usage.totalRegistrations += 1;

  await user.save();

  const token = signEndUserToken(user, app);

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
  }

  user.lastLoginAt = new Date();

  app.usage.totalLogins += 1;

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
  if (!req.endUser) {
    throw new ApiError(
      401,
      'UNAUTHORIZED',
      'Authentication required'
    );
  }

  const user = await req.endUser.populate('app');

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

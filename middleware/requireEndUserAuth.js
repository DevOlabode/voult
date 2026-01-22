const jwt = require('jsonwebtoken');
const EndUser = require('../models/endUser');
const { ApiError } = require('../utils/apiError');

module.exports = async function requireEndUserAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(
      401,
      'UNAUTHORIZED',
      'Authentication token is required'
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.ENDUSER_JWT_SECRET);

    const user = await EndUser.findById(payload.sub);

    if (!user) {
      throw new ApiError(
        401,
        'INVALID_TOKEN',
        'Invalid or expired token'
      );
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new ApiError(
        401,
        'TOKEN_REVOKED',
        'Token has been revoked'
      );
    }

    req.endUser = user;
    req.appId = payload.app;

    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;

    throw new ApiError(
      401,
      'INVALID_TOKEN',
      'Invalid or expired token'
    );
  }
};

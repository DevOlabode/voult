const jwt = require('jsonwebtoken');
const EndUser = require('../models/EndUser');
const { ApiError } = require('../utils/apiError');

const JWT_SECRET = process.env.ENDUSER_JWT_SECRET;

module.exports.verifyEndUserJWT = async (req, res, next) => {
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
    const payload = jwt.verify(token, JWT_SECRET);

    const endUser = await EndUser.findById(payload.sub);

    if (!endUser) {
      throw new ApiError(
        401,
        'INVALID_TOKEN',
        'Invalid authentication token'
      );
    }

    if (!endUser.isActive) {
      throw new ApiError(
        403,
        'ACCOUNT_DISABLED',
        'This account has been disabled'
      );
    }
    

    if (endUser.tokenVersion !== payload.tokenVersion) {
      throw new ApiError(
        401,
        'TOKEN_REVOKED',
        'Token has been revoked'
      );
    }

    req.endUser = endUser;
    req.tokenPayload = payload;
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.warn(`[AUTH] Expired token used`);
      throw new ApiError(
        401,
        'TOKEN_EXPIRED',
        'Authentication token has expired'
      );
    }

    if (err instanceof ApiError) {
      throw err;
    }

    throw new ApiError(
      401,
      'INVALID_TOKEN',
      'Invalid authentication token'
    );
  }
};

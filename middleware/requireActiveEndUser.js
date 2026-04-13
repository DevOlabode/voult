const { ApiError } = require('../utils/apiError');

/**
 * Use after `requireEndUserAuth`. Rejects disabled accounts (403).
 */
module.exports = function requireActiveEndUser(req, res, next) {
  if (!req.endUser.isActive) {
    return next(
      new ApiError(403, 'ACCOUNT_DISABLED', 'This account has been disabled')
    );
  }
  next();
};

const { sendError } = require('../utils/apiError');

module.exports = (err, req, res, next) => {
  // Only format API errors
  if (!req.originalUrl.startsWith('/api')) {
    return next(err);
  }

  console.error('API ERROR:', err);

  sendError(res, err);
};

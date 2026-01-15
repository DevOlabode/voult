const { ApiError } = require('../utils/apiError');

module.exports = function validateCallbackUrl(req, res, next) {
  const { callbackUrl } = req.body;
  const app = req.appClient;

  if (!callbackUrl) return next();

  const isAllowed = app.allowedCallbackUrls.includes(callbackUrl);

  if (!isAllowed) {
    throw new ApiError(
      400,
      'INVALID_CALLBACK_URL',
      'Callback URL is not allowlisted for this app'
    );
  }

  next();
};

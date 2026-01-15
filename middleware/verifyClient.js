const App = require('../models/App');
const { ApiError } = require('../utils/apiError');

module.exports.verifyClient = async (req, res, next) => {
  try {
    const clientId = req.header('X-Client-Id');
    const authHeader = req.header('Authorization');

    if (!clientId || !authHeader) {
      throw new ApiError(401, 'MISSING_CLIENT_CREDENTIALS', 'Client credentials missing');
    }

    const [scheme, clientSecret] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !clientSecret) {
      throw new ApiError(401, 'INVALID_AUTH_FORMAT', 'Invalid authorization format');
    }

    const app = await App.findOne({ clientId, deletedAt: null })
      .select('+clientSecretHash');

    if (!app) {
      console.warn(`[AUTH] Invalid clientId attempt: ${clientId}`);
      throw new ApiError(401, 'INVALID_CLIENT', 'Invalid client credentials');
    }

    if (!app.isActive) {
      console.warn(`[AUTH] Disabled app access attempt: ${clientId}`);
      throw new ApiError(403, 'APP_DISABLED', 'App is disabled');
    }

    const isValid = await app.verifyClientSecret(clientSecret);

    if (!isValid) {
      console.warn(`[AUTH] Invalid client secret for app ${clientId}`);
      throw new ApiError(401, 'INVALID_CLIENT_SECRET', 'Invalid client credentials');
    }

    req.appClient = app;
    next();

  } catch (err) {
    throw err;
  }
};

const App = require('../models/app')
const { ApiError } = require('../utils/apiError');

// module.exports.verifyClient = async (req, res, next) => {
//   try {
//     const clientId = req.header('X-Client-Id');
//     const authHeader = req.header('x-client-secret');

//     if (!clientId || !authHeader) {
//       throw new ApiError(401, 'MISSING_CLIENT_CREDENTIALS', 'Client credentials missing');
//     }

//     const [scheme, clientSecret] = authHeader.split(' ');

//     if (scheme !== 'Bearer' || !clientSecret) {
//       throw new ApiError(401, 'INVALID_AUTH_FORMAT', 'Invalid authorization format');
//     }

//     const app = await App.findOne({ clientId, deletedAt: null })
//       .select('+clientSecretHash');

//     if (!app) {
//       console.warn(`[AUTH] Invalid clientId attempt: ${clientId}`);
//       throw new ApiError(401, 'INVALID_CLIENT', 'Invalid client credentials');
//     }

//     if (!app.isActive) {
//       console.warn(`[AUTH] Disabled app access attempt: ${clientId}`);
//       throw new ApiError(403, 'APP_DISABLED', 'App is disabled');
//     }

//     const isValid = await app.verifyClientSecret(clientSecret);

//     if (!isValid) {
//       console.warn(`[AUTH] Invalid client secret for app ${clientId}`);
//       throw new ApiError(401, 'INVALID_CLIENT_SECRET', 'Invalid client credentials');
//     }

//     req.appClient = app;
//     next();

//   } catch (err) {
//     throw err;
//   }
// };


module.exports.verifyClient = async (req, res, next) => {
  const clientId = req.headers['x-client-id'];
  const clientSecret = req.headers['x-client-secret'];

  if (!clientId) {
    throw new ApiError(401, 'CLIENT_ID_REQUIRED', 'Client ID is required');
  }

  const app = await App.findOne({
    clientId,
    deletedAt: { $exists: false }
  });

  if (!app || !app.isActive) {
    throw new ApiError(401, 'INVALID_CLIENT', 'Invalid or inactive app');
  }

  // 🔑 Only require client secret for NON-OAUTH routes
  const isOAuthRoute =
    req.path.includes('/google/login') ||
    req.path.includes('/google/register');

  if (!isOAuthRoute) {
    if (!clientSecret) {
      throw new ApiError(
        401,
        'CLIENT_SECRET_REQUIRED',
        'Client secret is required'
      );
    }

    const isValid = await app.verifyClientSecret(clientSecret);
    if (!isValid) {
      throw new ApiError(401, 'INVALID_CLIENT_SECRET', 'Invalid client secret');
    }
  }

  req.appClient = app;
  next();
};

module.exports.verifyClientIdOnly = async (req, res, next) => {
  const clientId = req.headers['x-client-id'];

  if (!clientId) {
    throw new ApiError(401, 'CLIENT_ID_REQUIRED', 'Client ID is required');
  }

  const app = await App.findOne({ clientId });

  if (!app || !app.isActive) {
    throw new ApiError(401, 'INVALID_CLIENT', 'Invalid or inactive app');
  }

  req.appClient = app;
  next();
};

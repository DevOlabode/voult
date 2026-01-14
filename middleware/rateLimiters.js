const rateLimit = require('express-rate-limit');

/**
 * Helper to extract a unique key per app + IP
 */
const appKeyGenerator = (req) => {
  const clientId = req.headers['x-client-id'] || 'unknown-app';
  return `${clientId}:${req.ip}`;
};

/**
 * Auth routes limiter
 * Protects login & register
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  keyGenerator: appKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again later.'
  }
});

/**
 * General API limiter
 */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  keyGenerator: appKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Slow down.'
  }
});

const webAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50
});

module.exports = {
  authLimiter,
  apiLimiter,
  webAuthLimiter
};

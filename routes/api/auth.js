const express = require('express');
const router = express.Router();

//Rate Limiters

const { apiLimiter } = require('../../middleware/rateLimiters');


const { verifyClient } = require('../../middleware/verifyClient');
const authController = require('../../controllers/api/auth');

const { verifyEndUserJWT } = require('../../middleware/verifyEndUserJWT');

const requireEndUserAuth = require('../../middleware/requireEndUserAuth');

const { authLimiter } = require('../../middleware/rateLimiters');

const { validate } = require('../../validators/validate');
const schemas = require('../../validators/api/endUserAuth');

const catchAsync  = require('../../utils/catchAsync')

const validateCallbackUrl = require('../../middleware/validateCallbackUrl');

router.use(apiLimiter);

/*
  Headers required:
  X-Client-Id: app_xxx
  Authorization: Bearer client_secret
*/

router.post('/register', validate(schemas.registerSchema), verifyClient, validateCallbackUrl, authLimiter, catchAsync(authController.register));

router.post('/login', validate(schemas.loginSchema), verifyClient, authLimiter, validateCallbackUrl, catchAsync(authController.login));

router.get('/verify-email', catchAsync(authController.verifyEmail));

router.get('/me', verifyEndUserJWT, catchAsync(authController.me));

router.post('/forgot-password', verifyClient, catchAsync(authController.forgotPassword));

router.post('/reset-password', verifyClient, catchAsync(authController.resetPassword));

router.post('/logout', requireEndUserAuth, catchAsync(authController.logout));

router.get('/verify-email', catchAsync(authController.verifyEmail));

module.exports = router;
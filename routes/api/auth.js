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

const validateCallbackUrl = require('../../middleware/validateCallbackUrl');

router.use(apiLimiter);

/*
  Headers required:
  X-Client-Id: app_xxx
  Authorization: Bearer client_secret
*/

router.post('/register', validate(schemas.registerSchema), verifyClient, validateCallbackUrl, authLimiter, authController.register);

router.post('/login', validate(schemas.loginSchema), verifyClient, authLimiter, validateCallbackUrl, authController.login);

router.get('/verify-email', authController.verifyEmail);

router.get('/me', verifyEndUserJWT, authController.me);

router.post('/logout', requireEndUserAuth, authController.logout);

module.exports = router;
const express = require('express');
const router = express.Router();

//Rate Limiters

const { apiLimiter } = require('../../middleware/rateLimiters');


const { verifyClient, verifyClientIdOnly } = require('../../middleware/verifyClient');
const authController = require('../../controllers/api/auth');

const { verifyEndUserJWT } = require('../../middleware/verifyEndUserJWT');

const requireEndUserAuth = require('../../middleware/requireEndUserAuth');

const { authLimiter } = require('../../middleware/rateLimiters');

const { validate } = require('../../validators/validate');
const schemas = require('../../validators/api/endUserAuth');

const catchAsync  = require('../../utils/catchAsync');

const validateCallbackUrl = require('../../middleware/validateCallbackUrl');

router.use(apiLimiter);

/*
  Headers required:
  X-Client-Id: app_xxx
  Authorization: Bearer client_secret
*/

router.post('/register', validate(schemas.registerSchema), verifyClientIdOnly, validateCallbackUrl, authLimiter, catchAsync(authController.register));

router.post('/login', validate(schemas.loginSchema), verifyClientIdOnly, authLimiter, validateCallbackUrl, catchAsync(authController.login));

router.post('/logout', verifyClientIdOnly,requireEndUserAuth, authLimiter, validateCallbackUrl, catchAsync(authController.logout));

module.exports = router;
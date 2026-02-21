const express = require('express');
const router = express.Router();

const { apiLimiter } = require('../../middleware/rateLimiters');


const { verifyClient } = require('../../middleware/verifyClient');
const authController = require('../../controllers/api/auth');

const { verifyEndUserJWT } = require('../../middleware/verifyEndUserJWT');

const requireEndUserAuth = require('../../middleware/requireEndUserAuth');

const { authLimiter } = require('../../middleware/rateLimiters');

const { validate } = require('../../validators/validate');
const schemas = require('../../validators/api/endUserAuth');

const catchAsync  = require('../../utils/catchAsync');

const validateCallbackUrl = require('../../middleware/validateCallbackUrl');

const controller = require('../../controllers/api/user');

router.get('/me', verifyEndUserJWT, catchAsync(controller.me));

router.post('/forgot-password', verifyClient, catchAsync(controller.forgotPassword));

router.post('/reset-password', verifyClient, catchAsync(controller.resetPassword));

router.get('/verify-email', catchAsync(controller.verifyEmail));

router.post('/disable', verifyEndUserJWT, requireEndUserAuth, catchAsync(controller.disableAccount));

router.post('/reenable', requireEndUserAuth, catchAsync(controller.reenableAccount));

router.patch('/me', verifyEndUserJWT, catchAsync(controller.updateProfile));

module.exports = router;
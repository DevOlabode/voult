const express = require('express');
const router = express.Router();

const controller = require('../../controllers/api/google');

const requireEndUserAuth = require('../../middleware/requireEndUserAuth');
const { verifyClient, verifyClientIdOnly } = require('../../middleware/verifyClient');

const validateCallbackUrl = require('../../middleware/validateCallbackUrl');
const { authLimiter } = require('../../middleware/rateLimiters');

const catchAsync = require('../../utils/catchAsync');

router.post('/register', verifyClientIdOnly, validateCallbackUrl, authLimiter, catchAsync(controller.googleRegister));

router.post('/login', verifyClientIdOnly, validateCallbackUrl, authLimiter, catchAsync(controller.googleLogin));

module.exports = router;
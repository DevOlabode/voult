const express = require('express');
const router = express.Router();

const controller = require('../../controllers/api/google');

const requireEndUserAuth = require('../../middleware/requireEndUserAuth');
const { verifyClient, verifyClientIdOnly } = require('../../middleware/verifyClient');

const validateCallbackUrl = require('../../middleware/validateCallbackUrl');
const { authLimiter } = require('../../middleware/rateLimiters');

router.post('/register', verifyClientIdOnly, validateCallbackUrl, authLimiter, controller.googleRegister);

router.post('/login', verifyClientIdOnly, validateCallbackUrl, authLimiter, controller.googleLogin);

module.exports = router;
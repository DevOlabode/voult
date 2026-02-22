const express = require('express');
const router = express.Router();

const { verifyClient, verifyClientIdOnly } = require('../../middleware/verifyClient');

const validateCallbackUrl = require('../../middleware/validateCallbackUrl');
const { authLimiter } = require('../../middleware/rateLimiters');

const catchAsync = require('../../utils/catchAsync');

const controller = require('../../controllers/api/linkedin');

router.post('/auth/linkedin/register', verifyClient, catchAsync(controller.linkedinRegister));
router.post('/auth/linkedin/login', verifyClient, catchAsync(controller.linkedinLogin));

module.exports = router;
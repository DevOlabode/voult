const express = require('express');
const router = express.Router();
const controller = require('../../controllers/api/magicLink');
const catchAsync = require('../../utils/catchAsync');

const { apiLimiter, authLimiter } = require('../../middleware/rateLimiters');

router.post('/send-magic-link', apiLimiter, catchAsync(controller.sendLink));
router.post('/validate-magic-link', authLimiter, catchAsync(controller.validateToken));

module.exports = router;
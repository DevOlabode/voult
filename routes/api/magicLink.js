const express = require('express');
const router = express.Router();
const controller = require('../../controllers/api/magicLink');

const { apiLimiter, authLimiter } = require('../../middleware/rateLimiters');
const { csrfProtection } = require('../../middleware/csrfProtection');

const catchAsync = require('../../utils/catchAsync');

router.post('/send-magic-link', csrfProtection, apiLimiter, catchAsync(controller.sendLink));
router.post('/validate-magic-link', csrfProtection, authLimiter, catchAsync(controller.validateToken));

module.exports = router;
const express = require('express');
const router = express.Router();

const { verifyClient, verifyClientIdOnly } = require('../../middleware/verifyClient');

const validateCallbackUrl = require('../../middleware/validateCallbackUrl');
const { authLimiter } = require('../../middleware/rateLimiters');

const controller = require('../../controllers/api/linkedin');


module.exports = router;
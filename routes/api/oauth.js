const express = require('express');
const router = express.Router();

const { csrfProtection } = require('../../middleware/csrfProtection');

const controller = require('../../controllers/api/oauth');

// Generate OAuth authorization URL
router.post('/:provider/authorize', csrfProtection,  controller.generateAuthUrl);

// Handle OAuth callback
router.get('/:provider/callback', controller.handleCallback);

module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../../controllers/api/oauth');

// Generate OAuth authorization URL
router.post('/:provider/authorize', controller.generateAuthUrl);

// Handle OAuth callback
router.get('/:provider/callback', controller.handleCallback);

module.exports = router;

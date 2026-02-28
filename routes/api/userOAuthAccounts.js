const express = require('express');
const router = express.Router();
const controller = require('../../controllers/api/userOAuthAccounts');
const requireEndUserAuth = require('../../middleware/requireEndUserAuth');

// Protect all routes with end user authentication
router.use(requireEndUserAuth);

// GET /api/me/oauth - Get linked providers for current user
router.get('/me/oauth', controller.getLinkedProviders);

// DELETE /api/me/oauth/:provider - Unlink a provider
router.delete('/me/oauth/:provider', controller.unlinkProvider);

module.exports = router;
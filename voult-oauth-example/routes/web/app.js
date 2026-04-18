const express = require('express');
const router = express.Router();
const appController = require('../controllers/web/app');

// GET /app/:id/google-oauth
router.get('/:id/google-oauth', appController.getGoogleOAuthForm);
// POST /app/:id/google-oauth
router.post('/:id/google-oauth', appController.saveGoogleOAuth);
// POST /app/:id/update-google-oauth
router.post('/:id/update-google-oauth', appController.updateGoogleOAuth);

module.exports = router;

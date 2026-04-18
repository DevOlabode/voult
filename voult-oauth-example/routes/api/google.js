const express = require('express');
const router = express.Router();
// const googleController = require('../controllers/api/google');
const googleController = require('../../controllers/api/google');

// POST /api/google/login (ID Token)
router.post('/login', googleController.googleLogin);

// POST /api/google/authorize
router.post('/authorize', async (req, res, next) => {
  req.appId = req.headers['x-app-id']; 
  next();
}, googleController.authorize);

// GET /api/google/callback
router.get('/callback', googleController.callback);

module.exports = router;

const express = require('express');
const router = express.Router();

const { verifyClient } = require('../../middleware/verifyClient');
const authController = require('../../controllers/api/auth');

const { verifyEndUserJWT } = require('../../middleware/verifyEndUserJWT');

const requireEndUserAuth = require('../../middleware/requireEndUserAuth');

/*
  Headers required:
  X-Client-Id: app_xxx
  Authorization: Bearer client_secret
*/

router.post('/register', verifyClient, authController.register);

router.post('/login', verifyClient, authController.login);

router.get('/me', verifyEndUserJWT, authController.me);

router.post('/logout', requireEndUserAuth, authController.logout);

module.exports = router;
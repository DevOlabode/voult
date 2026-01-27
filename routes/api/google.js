const express = require('express');
const router = express.Router();

const controller = require('../../controllers/api/google');

const requireEndUserAuth = require('../../middleware/requireEndUserAuth');
const { verifyClient, verifyClientIdOnly } = require('../../middleware/verifyClient');

router.post('/register', verifyClientIdOnly, requireEndUserAuth, controller.googleRegister);

router.post('/login', verifyClientIdOnly, requireEndUserAuth, controller.googleLogin);

module.exports = router;
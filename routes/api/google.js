const express = require('express');
const router = express.Router();

const controller = require('../../controllers/api/google');

const requireEndUserAuth = require('../../middleware/requireEndUserAuth');
const { verifyClient, verifyClientIdOnly } = require('../../middleware/verifyClient');

router.post('/register', verifyClientIdOnly, controller.googleRegister);

router.post('/login', verifyClientIdOnly, controller.googleLogin);

module.exports = router;
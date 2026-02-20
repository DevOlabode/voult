const express = require('express');
const router = express.Router();

const { verifyClientIdOnly } = require('../../middleware/verifyClient');
const { verifyEndUserJWT } = require('../../middleware/verifyEndUserJWT');
const catchAsync = require('../../utils/catchAsync');

const controller = require('../../controllers/api/github');

router.post('/register', verifyClientIdOnly, catchAsync(controller.githubRegister));

router.post('/login', verifyClientIdOnly, catchAsync(controller.githubLogin));

router.get('/profile', verifyClientIdOnly, verifyEndUserJWT, catchAsync(controller.githubProfile));

module.exports = router;
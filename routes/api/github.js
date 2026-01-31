const express = require('express');
const router = express.Router();

const { verifyClient, verifyClientIdOnly } = require('../../middleware/verifyClient');
const catchAsync = require('../../utils/catchAsync');

const controller = require('../../controllers/api/github');

router.post('/register', verifyClientIdOnly, catchAsync(controller.githubRegister));

router.post('/login', verifyClientIdOnly, catchAsync(controller.githubLogin));

module.exports = router;
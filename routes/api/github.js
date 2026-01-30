const express = require('express');
const router = express.Router();

const { verifyClient, verifyClientIdOnly } = require('../../middleware/verifyClient');
const catchAsync = require('../../utils/catchAsync');

const controller = reqiure('../../controllers/api/github');

router.post('/github/register', verifyClientIdOnly, catchAsync(controller.githubRegister));

router.post('/github/login', verifyClientIdOnly, catchAsync(controller.githubLogin));

module.exports = router;
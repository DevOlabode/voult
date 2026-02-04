const express = require('express');
const router = express.Router();

const { verifyClient, verifyClientIdOnly } = require('../../middleware/verifyClient');
const catchAsync = require('../../utils/catchAsync');

const controller = require('../../controllers/api/facebook');

router.post('/register', verifyClientIdOnly, catchAsync(controller.facebookRegister));

router.post('/login', verifyClientIdOnly, catchAsync(controller.facebookLogin));

module.exports = router;
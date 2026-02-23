const express = require('express');
const router = express.Router();

const { verifyClientIdOnly } = require('../../middleware/verifyClient');
const { verifyEndUserJWT } = require('../../middleware/verifyEndUserJWT');
const catchAsync = require('../../utils/catchAsync');

const controller = require('../../controllers/api/apple');

router.post('/auth/apple/register', verifyClientIdOnly, catchAsync(controller.appleRegister));

router.post('/auth/apple/login', verifyClientIdOnly, catchAsync(controller.appleLogin));

module.exports = router;
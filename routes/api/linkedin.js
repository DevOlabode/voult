const express = require('express');
const router = express.Router();

const { verifyClientIdOnly } = require('../../middleware/verifyClient');

const catchAsync = require('../../utils/catchAsync');

const controller = require('../../controllers/api/linkedin');

router.post('/register', verifyClientIdOnly, catchAsync(controller.linkedinRegister));

router.post('/login', verifyClientIdOnly, catchAsync(controller.linkedinLogin));

module.exports = router;
const express = require('express');
const router = express.Router();
const controller  = require('../../controllers/api/magicLink');

const catchAsync  = require('../../utils/catchAsync');

router.post('/send-magic-link', catchAsync(controller.sendLink));
router.post('/validate-magic-link', catchAsync(controller.validateToken));

module.exports = router;

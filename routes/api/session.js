const express = require('express');
const router = express.Router();

const controller = require('../../controllers/api/session');

const catchAsync = require('../../utils/catchAsync');

router.get('/', catchAsync(controller.listSessions));

module.exports = router;
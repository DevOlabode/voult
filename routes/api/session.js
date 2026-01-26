const express = require('express');
const router = express.Router();

const controller = require('../../controllers/api/session');

const {verifyClient} = require('../../middleware/verifyClient');
const requireEndUserAuth = require('../../middleware/requireEndUserAuth')

const catchAsync = require('../../utils/catchAsync');

router.get('/', requireEndUserAuth , catchAsync(controller.listSessions));

module.exports = router;
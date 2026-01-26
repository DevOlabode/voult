const express = require('express');
const router = express.Router();

const controller = require('../../controllers/api/session');

const {verifyClient} = require('../../middleware/verifyClient');
const requireEndUserAuth = require('../../middleware/requireEndUserAuth');
const {verifyEndUserJWT} = require('../../middleware/verifyEndUserJWT')

const catchAsync = require('../../utils/catchAsync');

router.get('/', requireEndUserAuth, catchAsync(controller.listSessions));

router.get('revoke/:sessionId', requireEndUserAuth, catchAsync(controller.revokeSession));

module.exports = router;
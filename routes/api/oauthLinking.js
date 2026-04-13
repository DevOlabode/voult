const express = require('express');
const router = express.Router();

const controller = require('../../controllers/api/oauthLinking');
const requireEndUserAuth = require('../../middleware/requireEndUserAuth');
const requireActiveEndUser = require('../../middleware/requireActiveEndUser');
const catchAsync =require('../../utils/catchAsync');

router.post(
  '/oauth/:provider/link',
  requireEndUserAuth,
  requireActiveEndUser,
  catchAsync(controller.startLinking)
);

router.get(
  '/me/oauth-accounts',
  requireEndUserAuth,
  requireActiveEndUser,
  catchAsync(controller.getLinkedProviders)
);

router.delete(
  '/me/oauth-accounts/:provider',
  requireEndUserAuth,
  requireActiveEndUser,
  catchAsync(controller.unlinkProvider)
);

router.post(
  '/me/set-password',
  requireEndUserAuth,
  requireActiveEndUser,
  catchAsync(controller.setPassword)
);

module.exports = router;
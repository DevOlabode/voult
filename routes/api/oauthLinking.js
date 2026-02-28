const express = require('express');
const router = express.Router();

const controller = require('../../controllers/api/oauthLinking');
const requireEndUserAuth = require('../../middleware/requireEndUserAuth');
const catchAsync =require('../../utils/catchAsync');

router.post(
  '/oauth/:provider/link',
  requireEndUserAuth,
  catchAsync(controller.startLinking)
);

router.get(
  '/me/oauth-accounts',
  requireEndUserAuth,
  catchAsync(controller.getLinkedProviders)
);

router.delete(
  '/me/oauth-accounts/:provider',
  requireEndUserAuth,
  catchAsync(controller.unlinkProvider)
);

router.post(
  '/me/set-password',
  requireEndUserAuth,
  catchAsync(controller.setPassword)
);

module.exports = router;
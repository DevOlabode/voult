const express = require('express');
const router = express.Router();

const controller = require('../../controllers/api/oauthLinking');
const requireEndUserAuth = require('../../middleware/requireEndUserAuth');

router.post(
  '/oauth/:provider/link',
  requireEndUserAuth,
  controller.startLinking
);

router.get(
  '/me/oauth-accounts',
  requireEndUserAuth,
  controller.getLinkedProviders
);

router.delete(
  '/me/oauth-accounts/:provider',
  requireEndUserAuth,
  controller.unlinkProvider
);

router.post(
  '/me/set-password',
  requireEndUserAuth,
  controller.setPassword
);

module.exports = router;
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/api/providerVisibility');

router.get('/:clientId', controller.getProviderVisibility);

module.exports = router;
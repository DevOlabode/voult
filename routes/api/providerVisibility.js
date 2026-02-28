const express = require('express');
const router = express.Router();
const controller = require('../../controllers/api/providerVisibility');

const catchAsync = require('../../utils/catchAsync')

router.get('/:clientId', catchAsync(controller.getProviderVisibility));

module.exports = router;
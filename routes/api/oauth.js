const express = require('express');
const router = express.Router();
const controller = require('../../controllers/api/oauth');

router.get('/:provider/callback', controller.handleCallback);

module.exports = router;
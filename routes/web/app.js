const express = require('express');
const router = express.Router();

const controller = require('../../controllers/web/app');

const catchAsync = require('../../utils/catchAsync');

const {isLoggedIn} = require('../../middleware');

router.use(isLoggedIn);

router.get('/new', controller.newForm);

router.post('/', catchAsync(controller.newApp));

module.exports = router;
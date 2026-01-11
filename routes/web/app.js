const express = require('express');
const router = express.Router();

const controller = require('../../controllers/web/app');

const catchAsync = require('../../utils/catchAsync');

const {isLoggedIn} = require('../../middleware');

router.use(isLoggedIn);

router.get('/new', controller.newForm);

router.post('/', catchAsync(controller.newApp));

router.get('/:id', catchAsync(controller.manage));

router.delete('/:id', catchAsync(controller.deleteApp));

module.exports = router;
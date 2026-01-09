const express = require('express');
const router = express.Router();

const controller = require('../controllers/user');
const catchAsync = require('../utils/catchAsync');

const { isLoggedIn } = require('../middleware');

// router.use(isLoggedIn);

router.get('/dashboard',isLoggedIn, catchAsync(controller.dashboard));

router.get('/forgot-password', controller.forgotPasswordForm);

router.post('/forgot-password',catchAsync(controller.forgotPassword));

router.get('/reset-password/:token', catchAsync(controller.resetPasswordForm));

router.post('/reset-password/:token', catchAsync(controller.resetPassword));
  

module.exports = router;
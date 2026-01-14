const express = require('express');
const router = express.Router();

const passport = require('passport');

const controller = require('../../controllers/web/auth');

const catchAsync = require('../../utils/catchAsync');

const {redirectIfLoggedIn, storeReturnTo} = require('../../middleware');

const { webAuthLimiter } = require('../../middleware/rateLimiters')

router.get('/login', redirectIfLoggedIn, controller.loginForm);

router.post('/login', storeReturnTo, passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
  }), 
  webAuthLimiter,
  controller.login);

router.get('/register',redirectIfLoggedIn, controller.registerForm);

router.post('/register', webAuthLimiter, catchAsync(controller.register));

router.post('/logout', controller.logout);

router.get('/verify/:token', catchAsync(controller.verifyAccount));

module.exports = router;
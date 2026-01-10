const express = require('express');
const router = express.Router();

const passport = require('passport');

const controller = require('../controllers/auth');

const catchAsync = require('../utils/catchAsync');

const {redirectIfLoggedIn} = require('../middleware');

router.get('/login', redirectIfLoggedIn, controller.loginForm);

router.post('/login',  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
  }), 
  controller.login);

router.get('/register',redirectIfLoggedIn, controller.registerForm);

router.post('/register', catchAsync(controller.register));

router.post('/logout', controller.logout);

router.get('/verify/:token', catchAsync(controller.verifyAccount));


module.exports = router;
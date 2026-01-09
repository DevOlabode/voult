const express = require('express');
const router = express.Router();

const passport = require('passport');

const controller = require('../controllers/auth');

const catchAsync = require('../utils/catchAsync');

router.get('/login', controller.loginForm);

router.post('/login',  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
  }), 
  controller.login);

router.get('/register',controller.registerForm);

router.post('/register', catchAsync(controller.register));

router.get('/dashboard', catchAsync(controller.dashboard));

router.post('/logout', controller.logout)

module.exports = router;
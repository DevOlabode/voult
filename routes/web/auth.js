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

router.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  (req, res) => {
    res.redirect('/');
  }
);

router.get('/auth/github',
  passport.authenticate('github', {
    scope: ['user:email']
  })
);

router.get('/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login'
  }),
  (req, res) => {
    res.redirect('/');
  }
);

router.post('/logout', controller.logout);

router.get('/verify/:token', catchAsync(controller.verifyAccount));

module.exports = router;
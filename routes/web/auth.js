const express = require('express');
const router = express.Router();

const passport = require('passport');

const controller = require('../../controllers/web/auth');

const catchAsync = require('../../utils/catchAsync');

const { redirectIfLoggedIn, storeReturnTo, isLoggedIn } = require('../../middleware');

const { webAuthLimiter } = require('../../middleware/rateLimiters');

router.get('/login', redirectIfLoggedIn, controller.loginForm);

router.post('/login', storeReturnTo, webAuthLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Use custom authentication to handle both user not found and wrong password consistently
    const user = await controller.customAuthenticate(email, password);
    
    // Authentication successful - log in the user
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      
      // Call the original login controller to set lastLoginAt and redirect
      controller.login(req, res, next);
    });
    
  } catch (err) {
    // Set consistent error message for both scenarios
    req.flash('error', 'Invalid credentials. Please try again.');
    res.redirect('/login');
  }
});

router.get('/register', redirectIfLoggedIn, controller.registerForm);

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

router.get('/auth/google/link', isLoggedIn, controller.startLinkGoogle);
router.get('/auth/google/link/callback', controller.googleLinkCallback);

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

router.get('/auth/github/link', isLoggedIn, controller.startLinkGithub);
router.get('/auth/github/link/callback', controller.githubLinkCallback);

router.post('/logout', controller.logout);

router.get('/verify/:token', catchAsync(controller.verifyAccount));

module.exports = router;
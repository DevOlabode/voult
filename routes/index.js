const express = require('express');
const router = express.Router();

//   Web Routes (sessions + EJS)
const webAuthRoutes = require('./web/auth');
const webUserRoutes = require('./web/user');
const webAppRoutes = require('./web/app');

// API Routes
const apiAuthRoutes = require('./api/auth');
const sessionRoutes = require('./api/session');
const apiUserRoutes = require('./api/user');
const apiGoogle  = require('./api/google')

// Mount Web Routes
router.use('/', webAuthRoutes);
router.use('/', webUserRoutes);
router.use('/app', webAppRoutes);

// Mount API Routes
router.use('/api/auth', apiAuthRoutes);
router.use('/api/sessions', sessionRoutes);
router.use('/api/user', apiUserRoutes);
router.use('./api/auth/google', apiGoogle)
// router.use('/api/health', healthRoutes);

router.use(require('../middleware/apiErrorHandler'));

// Home Page Route
router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
      return res.render('home/home-logged-in', {
        user: req.user,
        title: 'voult.dev',
      });
    }
  
    res.render('home/home-guest', {
      title: 'voult.dev',
    });
  });

module.exports = router;

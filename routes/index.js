const express = require('express');
const router = express.Router();

//   Web Routes (sessions + EJS)

const webAuthRoutes = require('./web/auth');
const webUserRoutes = require('./web/user');
const webAppRoutes = require('./web/app')


//    Mount Web Routes

router.use('/', webAuthRoutes);
router.use('/', webUserRoutes);
router.use('/', webAppRoutes);

//    Mount API Routes

// router.use('/api/auth', apiAuthRoutes);
// router.use('/api/users', apiUserRoutes);
// router.use('/api/health', healthRoutes);


//Home Page Route

router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
      return res.render('home/home-logged-in', {
        user: req.user,
        title: 'AuthWay',
      });
    }
  
    res.render('home/home-guest', {
      title: 'AuthWay',
    });
  });

//    404 Handler

router.use((req, res) => {
  // API 404
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }

  // Web 404
  res.status(404).json({ title: 'Page Not Found' });
});

module.exports = router;

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
  
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
  
      req.session.returnTo = req.originalUrl;
      req.flash('error', 'You must be signed in first');
      return res.redirect('/login');
    }
  
    next();
  };

module.exports.redirectIfLoggedIn = (req, res, next)=>{
  if(req.isAuthenticated()){
    return res.redirect('/')
  };
  next();
};

module.exports.storeReturnTo = (req, res, next)=>{
  if(req.session.returnTo){
      res.locals.returnTo = req.session.returnTo
  }
  next();
};


module.exports.requireAPIKey = async (req, res, next) => {
  const apiKey = req.header('X-voult.dev-App-Key');

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const key = await ApiKey.findOne({ key }).populate('app');

  if (!key || !key.app.isActive) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  req.appClient = key.app;
  next();
};


// HOW FUTURE APPS WILL USE voult.dev.
/*
fetch('https://voult.dev/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-voult.dev-App-Key': 'sk_live_xxx'
  },
  body: JSON.stringify({
    email,
    password
  })
});
*/
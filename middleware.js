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
}  

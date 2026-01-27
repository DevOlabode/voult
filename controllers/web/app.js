const App = require('../../models/app');

module.exports.newForm = (req, res)=>{
    res.render('app/new', {title : 'New App'});
};

module.exports.newApp = async (req, res) => {
  const { name, description, callbackUrl } = req.body;

  const app = new App({
    name,
    description,
    owner: req.user._id,
    isActive: true,
    allowedCallbackUrls : callbackUrl
  });

  app.generateClientId();

  const rawClientSecret = app.generateClientSecret();

  await app.save();

  res.render('app/created', {
    app,
    clientSecret: rawClientSecret,
    title : `${app.name} client secret`
  });
};

module.exports.rotateClientSecret = async (req, res) => {
  const { id } = req.params;

  // Find app and ensure it belongs to the logged-in developer
  const app = await App.findOne({
    _id: id,
    owner: req.user._id,
    deletedAt: { $exists: false }
  });

  if (!app) {
    req.flash('error', 'App not found or access denied');
    return res.redirect('/dashboard');
  }

  // Generate new secret
  const newClientSecret = app.generateClientSecret();

  await app.save();

  // Show it ONCE
  res.render('app/rotated', {
    app,
    clientSecret: newClientSecret,
    title : 'Rotate Client Secret'
  });
};


module.exports.manage = async(req, res)=>{
    const app = await App.findById(req.params.id);
    res.render('app/manage', {app, title : `Manage ${app.name}`})
};

module.exports.deleteApp = async (req, res) => {
    const { id } = req.params;
  
    const app = await App.findById(id);
  
    if (!app) {
      req.flash('error', 'App not found');
      return res.redirect('/dashboard');
    }
  

    if (!app.owner.equals(req.user._id)) {
      req.flash('error', 'You are not authorized to delete this app');
      return res.redirect('/dashboard');
    }

    app.isActive = false;
    app.deletedAt = new Date();
  
    await app.save();
  
    req.flash('success', 'App deleted successfully');
    res.redirect('/dashboard');
  };

module.exports.editForm = async(req, res)=>{
    const app = await App.findById(req.params.id);
    res.render('app/edit', {app, title : `Edit ${app.name}`})
};

module.exports.updateApp = async (req, res) => {
    const { id } = req.params;
    const { name, description, callbackUrl, isActive } = req.body;
  
    const app = await App.findById(id);
  
    if (!app) {
      req.flash('error', 'App not found');
      return res.redirect('/dashboard');
    }

    if (!app.owner.equals(req.user._id)) {
      req.flash('error', 'You are not authorized to update this app');
      return res.redirect('/dashboard');
    }
  
    app.name = name;
    app.description = description;
    app.callbackUrl = callbackUrl;
    app.isActive = isActive === 'true';
  
    await app.save();
  
    req.flash('success', 'App updated successfully');
    res.redirect(`/app/${app._id}`);
  };

  module.exports.toggleApp = async (req, res) => {
    const { id } = req.params;
  
    const app = await App.findById(id);
  
    if (!app) {
      req.flash('error', 'App not found');
      return res.redirect('/dashboard');
    }
  
    if (!app.owner.equals(req.user._id)) {
      req.flash('error', 'You are not authorized to modify this app');
      return res.redirect('/dashboard');
    }
  
    app.isActive = !app.isActive;
    await app.save();
  
    req.flash(
      'success',
      `App ${app.isActive ? 'enabled' : 'disabled'} successfully`
    );
  
    res.redirect(`/app/${app._id}`);
};

module.exports.getGoogleOAuth = async (req, res) => {
  const app = await App.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!app) {
    req.flash('error', 'App not found or access denied');
    return res.redirect('/dashboard');
  }

  res.render('app/googleOAuthForm', {
    app,
    title: 'Configure Google OAuth',
  });
};


module.exports.saveGoogleOAuth = async (req, res) => {
  const { id } = req.params;
  const { clientId, clientSecret, redirectUri } = req.body;

  const app = await App.findOne({
    _id: id,
    owner: req.user._id,
  });

  if (!app) {
    req.flash('error', 'App not found or access denied');
    return res.redirect('/dashboard');
  }

  if (!clientId || !clientSecret || !redirectUri) {
    req.flash('error', 'All Google OAuth fields are required');
    return res.redirect(`/app/${id}/google-oauth`);
  }

  app.googleOAuth = {
    enabled: true,
    clientId,
    clientSecret,
    redirectUri,
  };

  await app.save();

  req.flash('success', 'Google OAuth configured successfully');
  res.redirect(`/app/${app._id}`);
};

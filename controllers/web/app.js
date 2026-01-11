const App = require('../../models/app');

module.exports.newForm = (req, res)=>{
    res.render('app/new', {title : 'New App'});
};

module.exports.newApp = async(req, res)=>{
    const { name, description, callbackUrl} = req.body;
    const app = new App({
        name,
        description,
        callbackUrl,
        owner : req.user._id,
        isActive : true
    });

    await app.save();

    req.flash('success', 'App created successdfully');
    res.redirect(`/app/${app._id}`);
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

  // Ownership check
  if (!app.owner.equals(req.user._id)) {
    req.flash('error', 'You are not authorized to delete this app');
    return res.redirect('/dashboard');
  }

  await App.findByIdAndDelete(id);

  req.flash('success', 'App deleted successfully');
  res.redirect('/dashboard');
};

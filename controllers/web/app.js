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

    req.flash('success', 'App created successdfully')
    res.redirect(`/app/${app._id}`);
};

module.exports.manage = async(req, res)=>{
    const app = await App.findById(req.params.id);
    res.render('app/manage', {app, title : `Manage ${app.name}`})
};
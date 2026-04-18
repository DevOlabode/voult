const App = require('../../models/App');

module.exports = {
  getGoogleOAuthForm: async (req, res) => {
    const app = await App.findById(req.params.id);
    res.render('app/google/googleOAuthForm', { app });
  },

  saveGoogleOAuth: async (req, res) => {
    const { clientId, clientSecret, redirectUri } = req.body;
    const app = await App.findByIdAndUpdate(req.params.id, {
      'googleOAuth.enabled': true,
      'googleOAuth.clientId': clientId,
      'googleOAuth.clientSecret': clientSecret,
      'googleOAuth.redirectUri': redirectUri
    }, { new: true });

    req.flash = req.flash || [];
    req.flash.push({ type: 'success', message: 'Google OAuth configured!' });
    res.redirect(`/app/${app._id}`);
  },

  updateGoogleOAuth: async (req, res) => {
    const updates = { 
      'googleOAuth.enabled': true,
      'googleOAuth.clientId': req.body.clientId,
      'googleOAuth.redirectUri': req.body.redirectUri 
    };
    if (req.body.clientSecret) {
      updates['googleOAuth.clientSecret'] = req.body.clientSecret;
    }

    await App.findByIdAndUpdate(req.params.id, updates);
    res.redirect(`/app/${req.params.id}/google-oauth`);
  }
};

const App = require('../../models/App');

exports.getProviderVisibility = async (req, res) => {
  try {
    const { appId } = req.params;
    
    const app = await App.findById(appId);
    
    if (!app || !app.isActive) {
      return res.status(404).json({ error: 'APP_NOT_FOUND' });
    }

    // Return visibility status for all providers
    const visibility = {
      google: app.googleOAuth?.enabled || false,
      github: app.githubOAuth?.enabled || false,
      facebook: app.facebookOAuth?.enabled || false,
      linkedin: app.linkedinOAuth?.enabled || false,
      apple: app.appleOAuth?.enabled || false,
      microsoft: app.microsoftOAuth?.enabled || false
    };

    return res.json({ providers: visibility });
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'FETCH_PROVIDER_VISIBILITY_FAILED' });
  }
};
const App = require('../../models/App');
const {ApiError} = require('../../utils/apiError')

module.exports.getProviderVisibility = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const app = await App.findOne({clientId});
    
    if (!app & !app.isActive) {
      throw new ApiError(
        404,
        'APP_NOT_FOUND',
        'Could not found app in the database'
      );
    };

    // console.log(app);

    // Return visibility status for all providers
    const visibility = {
      google: app.googleOAuth?.enabled,
      github: app.githubOAuth?.enabled,
      facebook: app.facebookOAuth?.enabled,
      linkedin: app.linkedinOAuth?.enabled,
      apple: app.appleOAuth?.enabled,
      microsoft: app.microsoftOAuth?.enabled
    };

    // console.log(visibility)

    return res.json({ providers: visibility });
    
  } catch (err) {
    // console.error(err);
    throw new ApiError(
      500,
      'FETCH_PROVIDER_VISIBILITY_FAILED',
      'Provider Visibility Failed'
    )
  }
};
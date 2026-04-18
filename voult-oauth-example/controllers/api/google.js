// const App = require('../../models/App');
const { OAuth2Client } = require('google-auth-library');
const { exchangeCodeForToken, getGoogleProfile } = require('../../utils/googleOAuth');
const { signAccessToken } = require('../../utils/jwt');

module.exports = {
  googleLogin: async (req, res) => {
    const { idToken } = req.body;
    const appId = req.headers['x-app-id'] || req.body.appId;
    const app = await App.findById(appId).select('+googleOAuth.clientSecret');

    if (!app?.googleOAuth?.clientId) {
      return res.status(400).json({ error: 'Google not configured' });
    }

    const client = new OAuth2Client(app.googleOAuth.clientId);
    const ticket = await client.verifyIdToken({ 
      idToken, 
      audience: app.googleOAuth.clientId 
    });
    const payload = ticket.getPayload();

    // TODO: Implement real EndUser model lookup/create/link
    const user = { id: payload.sub, email: payload.email, name: payload.name };

    const accessToken = signAccessToken(user, app);
    res.json({ success: true, accessToken, user });
  },

  authorize: async (req, res) => {
    const { intent, redirectUri } = req.body;
    const appId = req.headers['x-app-id'] || req.body.appId;
    const app = await App.findById(appId);

    if (!app?.googleOAuth?.enabled) {
      return res.status(400).json({ error: 'Google OAuth not enabled' });
    }

    const params = new URLSearchParams({
      client_id: app.googleOAuth.clientId,
      redirect_uri: app.googleOAuth.redirectUri,
      scope: 'openid email profile',
      response_type: 'code',
      state: Buffer.from(JSON.stringify({ intent, appId, redirectUri })).toString('base64'),
      access_type: 'offline'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    res.json({ authUrl });
  },

  callback: async (req, res) => {
    const { code, state: stateStr } = req.query;
    const state = JSON.parse(Buffer.from(stateStr, 'base64').toString());
    const { intent, appId, redirectUri } = state;
    const app = await App.findById(appId).select('+googleOAuth.clientSecret');

    try {
      const tokenData = await exchangeCodeForToken(
        code, 
        app.googleOAuth.clientId, 
        app.googleOAuth.clientSecret, 
        app.googleOAuth.redirectUri
      );
      
      const profile = await getGoogleProfile(tokenData.access_token);
      
      // TODO: Real user handling (create/link)
      const user = { id: profile.id, email: profile.email, name: profile.name };

      const accessToken = signAccessToken(user, app);
      res.redirect(`${redirectUri}?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(user))}`);
    } catch (error) {
      res.redirect(`${redirectUri}?error=${encodeURIComponent(error.message)}`);
    }
  }
};

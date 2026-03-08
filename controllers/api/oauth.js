// controllers/oauthController.js

const OAuthAccount = require('../../models/OAuthAccount');
const User = require('../../models/endUser');
const App = require('../../models/app');
const {createToken} = require('../../utils/createTokens');
const exchangeCodeForToken = require('../../utils/exchangeCodeForToken');
const getProviderProfile = require('../../utils/getProviderProfile');

function decodeState(state) {
  return JSON.parse(
    Buffer.from(state, 'base64url').toString()
  );
}

exports.handleCallback = async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ error: 'INVALID_OAUTH_CALLBACK' });
    }

    const decodedState = decodeState(state);
    const { intent, userId, appId } = decodedState;

    // 1️⃣ Fetch app with secrets and check provider enablement
    const app = await App.findById(appId).select('+googleOAuth.clientSecret +githubOAuth.clientSecret +facebookOAuth.appSecret +linkedinOAuth.clientSecret +appleOAuth.privateKey +microsoftOAuth.clientSecret');
    
    if (!app || !app.isActive) {
      return res.status(404).json({ error: 'APP_NOT_ACTIVE' });
    }

    const providerConfig = app[`${provider}OAuth`];
    if (!providerConfig || !providerConfig.enabled) {
      return res.status(403).json({ error: 'PROVIDER_DISABLED_FOR_THIS_APP' });
    }

    // 2️⃣ Exchange code for tokens using app credentials
    const tokenResponse = await exchangeCodeForToken(provider, code, app);

    // 3️⃣ Fetch provider profile
    const profile = await getProviderProfile(provider, tokenResponse);

    const providerUserId = profile.id;
    const email = profile.email;

    if (!providerUserId) {
      return res.status(400).json({ error: 'PROVIDER_ID_NOT_FOUND' });
    }

    // Check if this provider account already exists
    const existingOAuth = await OAuthAccount.findOne({
      provider,
      providerUserId
    });

    // ===============================
    // INTENT: LINK
    // ===============================
    if (intent === 'link') {

      if (!userId) {
        return res.status(400).json({ error: 'INVALID_LINK_STATE' });
      }

      if (existingOAuth && existingOAuth.user.toString() !== userId) {
        return res.status(409).json({
          error: 'PROVIDER_ALREADY_LINKED_TO_ANOTHER_USER'
        });
      }

      await OAuthAccount.findOneAndUpdate(
        { user: userId, provider, app: app._id },
        {
          providerUserId,
          profile: {
            email: profile.email,
            name: profile.name,
            avatar: profile.avatar,
            raw: profile.raw
          },
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          tokenExpiresAt: tokenResponse.expires_in
            ? new Date(Date.now() + tokenResponse.expires_in * 1000)
            : null
        },
        { upsert: true, new: true }
      );

      // Track linked provider on the end user document as well
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { linkedProviders: provider } }
      );

      return res.json({ message: 'ACCOUNT_LINKED_SUCCESSFULLY' });
    }

    // ===============================
    // INTENT: LOGIN
    // ===============================
    if (intent === 'login') {

      if (!existingOAuth) {
        return res.status(404).json({ error: 'ACCOUNT_NOT_REGISTERED' });
      }

      const user = await User.findById(existingOAuth.user);

      const token = createToken(user);

      return res.json({ token });
    }

    // ===============================
    // INTENT: REGISTER
    // ===============================
    if (intent === 'register') {

      if (existingOAuth) {
        return res.status(409).json({
          error: 'ACCOUNT_ALREADY_EXISTS'
        });
      }

      if (!email) {
        return res.status(400).json({
          error: 'EMAIL_REQUIRED_FOR_REGISTRATION'
        });
      }

      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          email,
          name: profile.name
        });
      }

      await OAuthAccount.create({
        user: user._id,
        app: app._id,
        provider,
        providerUserId,
        profile: {
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar,
          raw: profile.raw
        },
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token
      });

      const token = createToken(user);

      return res.json({ token });
    }

    return res.status(400).json({ error: 'INVALID_INTENT' });
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'OAUTH_CALLBACK_FAILED' });
  }
};

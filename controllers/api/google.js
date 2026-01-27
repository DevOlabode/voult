const EndUser = require('../../models/EndUser');
const App = require('../../models/App');
const { ApiError } = require('../../utils/apiError');
const { exchangeCodeForToken, getGoogleProfile } = require('../../utils/googleOAuth');
const { signAccessToken } = require('../../utils/jwt');
const { createRefreshToken } = require('../../utils/refreshToken');
  
module.exports.googleLogin = async (req, res) => {
    const { code } = req.body;
    const app = req.appClient;
  
    if (!code) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Authorization code is required');
    }
  
    if (!app.googleOAuth?.clientId) {
      throw new ApiError(400, 'GOOGLE_NOT_CONFIGURED', 'Google login not enabled');
    }
  
    const accessToken = await exchangeCodeForToken(
      code,
      app.googleOAuth.clientId,
      app.googleOAuth.clientSecret,
      app.googleOAuth.redirectUri
    );
  
    const profile = await getGoogleProfile(accessToken);
  
    const { id: googleId, email, verified_email, name } = profile;
  
    if (!verified_email) {
      throw new ApiError(403, 'EMAIL_NOT_VERIFIED', 'Google email not verified');
    }
  
    let user = await EndUser.findOne({
      app: app._id,
      email,
      deletedAt: null
    });
  
    // 🔁 Existing user → link Google
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.isEmailVerified = true;
        await user.save();
      }
    } 
    // else {
    //   // 🆕 New user
    //   user = await EndUser.create({
    //     app: app._id,
    //     email,
    //     googleId,
    //     authProvider: 'google',
    //     isEmailVerified: true
    //   });
    // }
  
    if (!user.isActive) {
      throw new ApiError(403, 'ACCOUNT_DISABLED', 'Account is disabled');
    }
  
    user.lastLoginAt = new Date();
    await user.save();
  
    const accessJwt = signAccessToken(user, app);
  
    const { rawToken: refreshToken } = await createRefreshToken({
      endUser: user,
      app,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
  
    res.status(200).json({
      message: 'Google login successful',
      accessToken: accessJwt,
      refreshToken,
      user: {
        id: user._id,
        email: user.email
      }
    });
};

module.exports.googleRegister = async (req, res) => {
  const app = req.appClient;
  console.log('App Client:', app);

  /* ---------------------- Validation ---------------------- */

  if (
    !app.googleOAuth ||
    !app.googleOAuth.clientId ||
    // !app.googleOAuth.clientSecret ||
    !app.googleOAuth.redirectUri
  ) {
    throw new ApiError(
      400,
      'GOOGLE_NOT_CONFIGURED',
      'Google OAuth is not fully configured for this app'
    );
  }

  /* ------------------- OAuth Verification ------------------ */
  const googleAccessToken = await exchangeCodeForToken(
    app.googleOAuth.clientId,
    app.googleOAuth.clientSecret,
    app.googleOAuth.redirectUri
  );
  
  const profile = await getGoogleProfile(googleAccessToken);

  const {
    id: googleId,
    email,
    verified_email,
    name
  } = profile;

  if (!verified_email) {
    throw new ApiError(
      403,
      'EMAIL_NOT_VERIFIED',
      'Google email is not verified'
    );
  }

  /* ------------------ Prevent duplicates ------------------ */
  const existingUser = await EndUser.findOne({
    app: app._id,
    email,
    deletedAt: null
  });

  if (existingUser) {
    throw new ApiError(
      409,
      'USER_EXISTS',
      'An account with this email already exists'
    );
  }

  /* ------------------ Create new user ------------------ */
  const user = await EndUser.create({
    app: app._id,
    email,
    fullName: name,           // IMPORTANT: your schema requires fullName
    googleId,
    authProvider: 'google',
    isEmailVerified: true,
    isActive: true,
    lastLoginAt: new Date()
  });

  /* ------------------ App usage tracking ------------------ */
  await App.updateOne(
    { _id: app._id },
    { $inc: { 'usage.totalRegistrations': 1 } }
  );

  /* ------------------ Issue tokens ------------------ */
  const accessToken = signAccessToken(user, app);

  const { rawToken: refreshToken } = await createRefreshToken({
    endUser: user,
    app,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  /* ------------------ Response ------------------ */
  res.status(201).json({
    message: 'Google registration successful',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email
    }
  });
};

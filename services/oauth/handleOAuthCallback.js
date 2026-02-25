const User = require('../../models/User');
const OAuthAccount = require('../../models/OAuthAccount');
const { createTokens } = require('../auth/createTokens');

async function handleOAuthCallback({
  provider,
  providerUserId,
  email,
  emailVerified,
  accessToken,
  refreshToken,
  state
}) {

  // 1️⃣ Check if this OAuth account already exists
  const existingOAuth = await OAuthAccount.findOne({
    provider,
    providerUserId
  });

  if (existingOAuth) {
    const user = await User.findById(existingOAuth.userId);
    return createTokens(user);
  }

  // 2️⃣ Linking flow (user already logged in)
  if (state?.intent === 'link' && state?.userId) {
    const user = await User.findById(state.userId);

    if (!user) throw new Error('USER_NOT_FOUND');

    await OAuthAccount.create({
      userId: user._id,
      provider,
      providerUserId,
      accessToken,
      refreshToken
    });

    return { linked: true };
  }

  // 3️⃣ No OAuth found → check email
  if (email) {
    const userByEmail = await User.findOne({ email });

    if (userByEmail && emailVerified) {
      await OAuthAccount.create({
        userId: userByEmail._id,
        provider,
        providerUserId,
        accessToken,
        refreshToken
      });

      return createTokens(userByEmail);
    }
  }

  // 4️⃣ Create new user
  const newUser = await User.create({
    email,
    emailVerified: emailVerified || false
  });

  await OAuthAccount.create({
    userId: newUser._id,
    provider,
    providerUserId,
    accessToken,
    refreshToken
  });

  return createTokens(newUser);
}

module.exports = handleOAuthCallback;
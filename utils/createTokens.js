// utils/createTokens.js

const { signAccessToken } = require('./jwt');
const { createRefreshToken } = require('./refreshToken');

module.exports.createTokens = async ({
  user,
  app,
  ipAddress,
  userAgent
}) => {

  const accessToken = signAccessToken(user, app);

  const { rawToken: refreshToken } = await createRefreshToken({
    endUser: user,
    app,
    ipAddress,
    userAgent
  });

  return {
    accessToken,
    refreshToken
  };
};
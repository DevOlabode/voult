// utils/createTokens.js

const { signAccessToken } = require('./jwt');
const { createRefreshToken } = require('./refreshToken');

const jwt = require('jsonwebtoken');

module.exports = function createToken(user) {

  return jwt.sign(
    {
      userId: user._id,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
};

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
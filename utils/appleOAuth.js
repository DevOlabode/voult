const jwt = require('jsonwebtoken');
const axios = require('axios');
const { ApiError } = require('./apiError');

/* Generate Apple client secret */
exports.generateAppleClientSecret = ({
  clientId,
  teamId,
  keyId,
  privateKey
}) => {
  const now = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      iss: teamId,
      iat: now,
      exp: now + 60 * 60 * 24 * 180, // 6 months max
      aud: 'https://appleid.apple.com',
      sub: clientId
    },
    privateKey,
    {
      algorithm: 'ES256',
      keyid: keyId
    }
  );
};

/* Exchange code for token */
exports.exchangeAppleCode = async ({
  code,
  clientId,
  clientSecret,
  redirectUri
}) => {
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('redirect_uri', redirectUri);

    const { data } = await axios.post(
      'https://appleid.apple.com/auth/token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return data;
  } catch {
    throw new ApiError(
      401,
      'APPLE_TOKEN_EXCHANGE_FAILED',
      'Failed to exchange Apple authorization code'
    );
  }
};

/* Verify Apple ID token */
exports.verifyAppleIdToken = (idToken) => {
  try {
    const decoded = jwt.decode(idToken);

    if (!decoded || !decoded.sub) {
      throw new Error();
    }

    return {
      appleId: decoded.sub,
      email: decoded.email || null,
      emailVerified: decoded.email_verified === 'true'
    };
  } catch {
    throw new ApiError(
      401,
      'INVALID_APPLE_ID_TOKEN',
      'Invalid Apple ID token'
    );
  }
};
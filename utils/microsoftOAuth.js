const axios = require('axios');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { ApiError } = require('./apiError');

/* Exchange authorization code for tokens */
exports.exchangeMicrosoftCode = async ({
  code,
  clientId,
  clientSecret,
  redirectUri,
  tenantId
}) => {
  try {
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('scope', 'openid profile email');
    params.append('code', code);
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');
    params.append('client_secret', clientSecret);

    const { data } = await axios.post(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
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
      'MICROSOFT_TOKEN_EXCHANGE_FAILED',
      'Failed to exchange Microsoft authorization code'
    );
  }
};

/* Verify ID token using JWKS */
exports.verifyMicrosoftIdToken = async (idToken, tenantId, clientId) => {
  try {
    const decodedHeader = jwt.decode(idToken, { complete: true });

    const client = jwksClient({
      jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`
    });

    const key = await client.getSigningKey(decodedHeader.header.kid);
    const signingKey = key.getPublicKey();

    const verified = jwt.verify(idToken, signingKey, {
      audience: clientId,
      issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`
    });

    return {
      microsoftId: verified.sub,
      email: verified.email || verified.preferred_username || null,
      fullName: verified.name || null,
      emailVerified: true
    };
  } catch {
    throw new ApiError(
      401,
      'INVALID_MICROSOFT_ID_TOKEN',
      'Invalid Microsoft ID token'
    );
  }
};
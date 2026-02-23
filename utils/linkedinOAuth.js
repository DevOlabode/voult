const axios = require('axios');
const { ApiError } = require('./apiError');

module.exports.exchangeCodeForToken = async ({
  code,
  clientId,
  clientSecret,
  redirectUri
}) => {
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUri);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const { data } = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return data.access_token;
  } catch {
    throw new ApiError(
      401,
      'LINKEDIN_TOKEN_EXCHANGE_FAILED',
      'Failed to exchange LinkedIn authorization code'
    );
  }
};

module.exports.getLinkedInProfile = async (accessToken) => {
  try {
    const { data } = await axios.get(
      'https://api.linkedin.com/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    return {
      linkedinId: data.sub,
      email: data.email,
      fullName:
        data.given_name && data.family_name
          ? `${data.given_name} ${data.family_name}`
          : data.name || null
    };
  } catch {
    throw new ApiError(
      401,
      'LINKEDIN_PROFILE_FETCH_FAILED',
      'Failed to fetch LinkedIn profile'
    );
  }
};
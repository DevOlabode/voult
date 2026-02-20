const axios = require('axios');
const { ApiError } = require('./apiError');

module.exports.exchangeCodeForToken = async ({
  code,
  clientId,
  clientSecret,
  redirectUri
}) => {
  try {
    const body = {
      client_id: clientId,
      client_secret: clientSecret,
      code
    };
    if (redirectUri) {
      body.redirect_uri = redirectUri;
    }

    const { data } = await axios.post(
      'https://github.com/login/oauth/access_token',
      body,
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );

    // GitHub returns 200 with error/error_description in body when something is wrong
    if (data.error) {
      const message =
        data.error_description || data.error || 'GitHub token exchange failed';
      const codeMap = {
        bad_verification_code: 'INVALID_GITHUB_CODE',
        redirect_uri_mismatch: 'REDIRECT_URI_MISMATCH',
        incorrect_client_credentials: 'GITHUB_CLIENT_INVALID'
      };
      throw new ApiError(
        400,
        codeMap[data.error] || 'GITHUB_OAUTH_FAILED',
        message
      );
    }

    if (!data.access_token) {
      throw new ApiError(400, 'INVALID_GITHUB_CODE', 'Failed to exchange GitHub code');
    }

    return data.access_token;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const msg =
      err.response?.data?.error_description ||
      err.response?.data?.error ||
      err.message;
    console.error('GitHub token exchange error:', msg, err.response?.data);
    throw new ApiError(
      400,
      'GITHUB_OAUTH_FAILED',
      err.response?.data?.error_description || 'GitHub token exchange failed'
    );
  }
};

module.exports.getGitHubProfile = async (accessToken) => {
  const { data: profile } = await axios.get('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const { data: emails } = await axios.get(
    'https://api.github.com/user/emails',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  const primaryEmail = emails.find(e => e.primary && e.verified);

  if (!primaryEmail) {
    throw new ApiError(403, 'EMAIL_NOT_VERIFIED', 'GitHub email not verified');
  }

  return {
    githubId: profile.id.toString(),
    name: profile.name || profile.login,
    email: primaryEmail.email
  };
};

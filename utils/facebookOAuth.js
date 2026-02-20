const axios = require('axios');
const { ApiError } = require('./apiError');

exports.getFacebookProfile = async (accessToken) => {
  try {
    const { data } = await axios.get(
      'https://graph.facebook.com/me',
      {
        params: {
          fields: 'id,name,email,first_name,last_name',
          access_token: accessToken
        }
      }
    );

    if (!data.id) {
      throw new ApiError(
        401,
        'INVALID_FACEBOOK_TOKEN',
        'Invalid Facebook profile response'
      );
    }

    return {
      facebookId: data.id,
      email: data.email || null,
      fullName:
        data.first_name && data.last_name
          ? `${data.first_name} ${data.last_name}`
          : data.name || null
    };
  } catch {
    throw new ApiError(
      401,
      'INVALID_FACEBOOK_TOKEN',
      'Invalid Facebook access token'
    );
  }
};

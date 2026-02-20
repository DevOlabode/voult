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

    // if (!data.id || !data.email) {
    //   throw new ApiError(
    //     403,
    //     'FACEBOOK_EMAIL_REQUIRED',
    //     'Facebook email permission is required'
    //   );
    // }

    return {
      facebookId: data.id,
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

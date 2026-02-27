// utils/getProviderProfile.js

const axios = require('axios');

module.exports = async function getProviderProfile(provider, tokenData) {

  switch (provider) {

    case 'google': {
      const { data } = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      );

      return {
        id: data.sub,
        email: data.email,
        name: data.name
      };
    }

    case 'github': {
      const { data } = await axios.get(
        'https://api.github.com/user',
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      );

      return {
        id: data.id.toString(),
        email: data.email,
        name: data.name
      };
    }

    default:
      throw new Error('PROFILE_FETCH_NOT_IMPLEMENTED');
  }
};
// utils/exchangeCodeForToken.js

const axios = require('axios');

module.exports = async function exchangeCodeForToken(provider, code) {

  switch (provider) {

    case 'google':
      return (
        await axios.post('https://oauth2.googleapis.com/token', {
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code'
        })
      ).data;

    case 'github':
      return (
        await axios.post(
          'https://github.com/login/oauth/access_token',
          {
            code,
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET
          },
          { headers: { Accept: 'application/json' } }
        )
      ).data;

    default:
      throw new Error('TOKEN_EXCHANGE_NOT_IMPLEMENTED');
  }
};
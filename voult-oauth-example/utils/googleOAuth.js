const axios = require('axios');

async function exchangeCodeForToken(code, clientId, clientSecret, redirectUri) {
  const { data } = await axios.post('https://oauth2.googleapis.com/token', {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  return data;
}

async function getGoogleProfile(accessToken) {
  const { data } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return data;
}

module.exports = { exchangeCodeForToken, getGoogleProfile };

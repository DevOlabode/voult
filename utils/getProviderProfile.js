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
        name: data.name,
        avatar: data.picture,
        raw: data
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
        name: data.name,
        avatar: data.avatar_url,
        raw: data
      };
    }

    case 'facebook': {
      const { data } = await axios.get(
        'https://graph.facebook.com/me?fields=id,name,email,picture.width(200).height(200)',
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      );

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        avatar: data.picture?.data?.url,
        raw: data
      };
    }

    case 'linkedin': {
      const { data } = await axios.get(
        'https://api.linkedin.com/v2/userinfo',
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      );

      return {
        id: data.sub,
        email: data.email,
        name: data.name || `${data.given_name} ${data.family_name}`,
        avatar: data.picture,
        raw: data
      };
    }

    case 'microsoft': {
      const { data } = await axios.get(
        'https://graph.microsoft.com/v1.0/me',
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      );

      return {
        id: data.id,
        email: data.mail || data.userPrincipalName,
        name: data.displayName,
        avatar: null, // Would need separate call to get photo
        raw: data
      };
    }

    case 'apple': {
      // Apple doesn't provide profile in token exchange response
      // This would typically be handled during the initial sign-in flow
      // For now, return minimal data
      return {
        id: tokenData.user?.sub || 'apple_user',
        email: tokenData.user?.email,
        name: tokenData.user?.name,
        avatar: null,
        raw: tokenData.user
      };
    }

    default:
      throw new Error('PROFILE_FETCH_NOT_IMPLEMENTED');
  }
};
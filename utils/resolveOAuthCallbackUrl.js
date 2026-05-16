const url = require('url');
const { originalURL } = require('passport-oauth2/lib/utils');

/** Developer login / link OAuth paths (must match Google/GitHub console entries). */
const PATHS = {
  google: {
    login: '/auth/google/callback',
    link: '/auth/google/link/callback',
  },
  github: {
    login: '/auth/github/callback',
    link: '/auth/github/link/callback',
  },
};

/**
 * Absolute redirect URI for this request — same algorithm passport-oauth2 uses
 * when resolving a relative callbackURL (originalURL + url.resolve).
 */
function resolveOAuthCallbackUrl(req, relativePath) {
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return url.resolve(originalURL(req, { proxy: true }), path);
}

module.exports = {
  PATHS,
  resolveOAuthCallbackUrl,
};

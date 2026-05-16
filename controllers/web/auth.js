const Developer = require('../../models/developer');
const passport = require('passport');
const { welcomeEmail } = require('../../services/emailService');
const crypto = require('crypto');
const {
  PATHS: OAUTH_PATHS,
  resolveOAuthCallbackUrl,
} = require('../../utils/resolveOAuthCallbackUrl');

function logOAuthError(strategy, err, callbackURL) {
  console.error(`[${strategy}] OAuth callback URL used:`, callbackURL);
  console.error(`[${strategy}] FULL OAUTH ERROR:`, err);
  if (err?.oauthError) {
    console.error(`[${strategy}] oauthError:`, err.oauthError);
    if (err.oauthError.data) {
      console.error(`[${strategy}] oauthError.data:`, err.oauthError.data);
    }
  }
}

function extractOAuthDetail(err) {
  const inner = err?.oauthError;
  const parts = [err?.message, inner?.message, err?.code, inner?.code];

  if (typeof inner?.data === 'string') {
    parts.push(inner.data);
    try {
      const j = JSON.parse(inner.data);
      if (j?.error) parts.push(j.error);
      if (j?.error_description) parts.push(j.error_description);
    } catch (_) {
      /* ignore */
    }
  }

  return parts.filter(Boolean).join(' ').trim();
}

function oauthErrorMessage(strategy, err) {
  const blob = extractOAuthDetail(err);

  if (
    err?.code === 'invalid_grant' ||
    /invalid_grant|Malformed auth code/i.test(blob)
  ) {
    return 'Sign-in expired or was already used. Please try again.';
  }
  if (/redirect_uri_mismatch|redirect_uri/i.test(blob)) {
    return (
      'OAuth redirect URL mismatch. In Google Cloud Console → Credentials, add the exact ' +
      'callback URL shown in your server logs under "OAuth callback URL used".'
    );
  }
  if (/Unable to verify authorization request state/i.test(blob)) {
    return 'Sign-in session expired. Please try again (cookies must be enabled).';
  }
  if (/access_denied|access denied/i.test(blob)) {
    return 'Sign-in was cancelled.';
  }
  if (err?.name === 'GooglePlusAPIError' || err?.name === 'UserInfoError') {
    return 'Could not load your Google profile. Please try again.';
  }

  if (process.env.NODE_ENV !== 'production' && blob) {
    return `Sign-in failed: ${blob.slice(0, 200)}`;
  }

  return 'Sign-in failed. Please try again.';
}

function oauthCallback(strategy, req, res, next) {
  const path = OAUTH_PATHS[strategy]?.login;
  if (!path) {
    req.flash('error', 'Unsupported sign-in provider.');
    return res.redirect('/login');
  }

  const callbackURL = resolveOAuthCallbackUrl(req, path);

  passport.authenticate(strategy, { callbackURL }, (err, user, info) => {
    if (err) {
      logOAuthError(strategy, err, callbackURL);
      req.flash('error', oauthErrorMessage(strategy, err));
      return res.redirect('/login');
    }
    if (!user) {
      const message = info?.message || 'Sign-in was cancelled or failed.';
      req.flash('error', message);
      return res.redirect('/login');
    }
    req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error(`[${strategy}] req.login error:`, loginErr);
        req.flash('error', 'Could not sign you in. Please try again.');
        return res.redirect('/login');
      }
      try {
        user.lastLoginAt = new Date();
        await user.save();
        req.flash('success', 'Welcome back');
        res.redirect(res.locals.returnTo || '/');
      } catch (saveErr) {
        next(saveErr);
      }
    });
  })(req, res, next);
}

function startOAuth(strategy, req, res, next, { path, scope }) {
  const callbackURL = resolveOAuthCallbackUrl(req, path);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${strategy}] OAuth start → redirect_uri:`, callbackURL);
  }
  passport.authenticate(strategy, { scope, callbackURL })(req, res, next);
}

module.exports.loginForm = (req, res) => {
  res.render('auth/login', { title: 'Login Page' });
};

module.exports.login = async (req, res) => {
  req.user.lastLoginAt = new Date();
  await req.user.save();

  req.flash('success', 'Welcome back');
  const returnUrl = res.locals.returnTo || '/';
  res.redirect(returnUrl);
};

module.exports.registerForm = (req, res) => {
  res.render('auth/register', { title: 'Register Form' });
};

module.exports.register = async (req, res) => {
  try {
    const { email, name, password, username } = req.body;

    if (!email || !name || !password) {
      req.flash('error', 'All fields are required');
      return res.redirect('/register');
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');

    const developer = new Developer({
      name,
      email,
      username,
      verifyToken,
      verifyTokenExpires: Date.now() + 1000 * 60 * 60 * 24,
    });

    const verifyUrl = `${process.env.BASE_URL}/verify/${verifyToken}`;

    await Developer.register(developer, password);
    await developer.save();

    await welcomeEmail(developer.email, developer.name, verifyUrl);

    req.login(developer, (err) => {
      if (err) throw err;
      req.flash('success', 'Account created successfully');
      res.redirect('/');
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/register');
  }
};

module.exports.googleCallback = (req, res, next) =>
  oauthCallback('google', req, res, next);

module.exports.githubCallback = (req, res, next) =>
  oauthCallback('github', req, res, next);

module.exports.startGoogle = (req, res, next) =>
  startOAuth('google', req, res, next, {
    path: OAUTH_PATHS.google.login,
    scope: ['profile', 'email'],
  });

module.exports.startGithub = (req, res, next) =>
  startOAuth('github', req, res, next, {
    path: OAUTH_PATHS.github.login,
    scope: ['user:email'],
  });

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash('success', 'You have logged out successfully');
    res.redirect('/');
  });
};

module.exports.verifyAccount = async (req, res) => {
  const developer = await Developer.findOne({
    verifyToken: req.params.token,
    verifyTokenExpires: { $gt: Date.now() },
  });

  if (!developer) {
    req.flash('error', 'Verification link is invalid or expired.');
    return res.redirect('/login');
  }

  developer.isVerified = true;
  developer.verifyToken = undefined;
  developer.verifyTokenExpires = undefined;

  await developer.save();

  req.flash('success', 'Your account has been verified. You can now log in.');
  res.redirect('/login');
};

// ---- Link OAuth providers to developer account (must be logged in) ----

module.exports.startLinkGoogle = (req, res, next) => {
  req.session.linkingUserId = req.user._id.toString();
  startOAuth('google', req, res, next, {
    path: OAUTH_PATHS.google.link,
    scope: ['profile', 'email'],
  });
};

module.exports.googleLinkCallback = (req, res, next) => {
  const targetId = req.session.linkingUserId;
  if (targetId) delete req.session.linkingUserId;

  const callbackURL = resolveOAuthCallbackUrl(req, OAUTH_PATHS.google.link);

  passport.authenticate(
    'google',
    { callbackURL, failureRedirect: '/settings' },
    async (err, user, info) => {
      if (err) {
        logOAuthError('google-link', err, callbackURL);
        req.flash('error', oauthErrorMessage('google', err));
        return res.redirect('/settings');
      }
      if (!user) {
        req.flash('error', 'Google sign-in was cancelled or failed.');
        return res.redirect('/settings');
      }
      if (!targetId) {
        req.flash('error', 'Link session expired. Please try again.');
        return res.redirect('/settings');
      }

      const target = await Developer.findById(targetId);
      if (!target) {
        req.flash('error', 'Account not found.');
        return res.redirect('/settings');
      }

      target.googleId = user.googleId;
      if (!target.avatar && user.avatar) target.avatar = user.avatar;
      await target.save();

      if (user._id.toString() !== targetId) {
        await Developer.findByIdAndUpdate(user._id, { $unset: { googleId: 1 } });
        req.login(target, (loginErr) => {
          if (loginErr) return next(loginErr);
          req.flash('success', 'Google account linked.');
          res.redirect('/settings');
        });
      } else {
        req.flash('success', 'Google account linked.');
        res.redirect('/settings');
      }
    }
  )(req, res, next);
};

module.exports.startLinkGithub = (req, res, next) => {
  req.session.linkingUserId = req.user._id.toString();
  startOAuth('github', req, res, next, {
    path: OAUTH_PATHS.github.link,
    scope: ['user:email'],
  });
};

module.exports.githubLinkCallback = (req, res, next) => {
  const targetId = req.session.linkingUserId;
  if (targetId) delete req.session.linkingUserId;

  const callbackURL = resolveOAuthCallbackUrl(req, OAUTH_PATHS.github.link);

  passport.authenticate(
    'github',
    { callbackURL, failureRedirect: '/settings' },
    async (err, user, info) => {
      if (err) {
        logOAuthError('github-link', err, callbackURL);
        req.flash('error', oauthErrorMessage('github', err));
        return res.redirect('/settings');
      }
      if (!user) {
        req.flash('error', 'GitHub sign-in was cancelled or failed.');
        return res.redirect('/settings');
      }
      if (!targetId) {
        req.flash('error', 'Link session expired. Please try again.');
        return res.redirect('/settings');
      }

      const target = await Developer.findById(targetId);
      if (!target) {
        req.flash('error', 'Account not found.');
        return res.redirect('/settings');
      }

      target.githubId = user.githubId;
      if (!target.avatar && user.avatar) target.avatar = user.avatar;
      await target.save();

      if (user._id.toString() !== targetId) {
        await Developer.findByIdAndUpdate(user._id, { $unset: { githubId: 1 } });
        req.login(target, (loginErr) => {
          if (loginErr) return next(loginErr);
          req.flash('success', 'GitHub account linked.');
          res.redirect('/settings');
        });
      } else {
        req.flash('success', 'GitHub account linked.');
        res.redirect('/settings');
      }
    }
  )(req, res, next);
};

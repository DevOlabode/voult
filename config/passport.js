const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Developer = require('../models/developer');
const GitHubStrategy = require('passport-github').Strategy;

passport.use(Developer.createStrategy());
passport.serializeUser(Developer.serializeUser());
passport.deserializeUser(Developer.deserializeUser());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://voult.dev/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {

    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;
    const avatar = profile.photos?.[0]?.value;

    // 1️⃣ Check if already linked
    let developer = await Developer.findOne({ googleId });

    if (developer) {
      return done(null, developer);
    }

    // 2️⃣ Check if email exists (link account)
    developer = await Developer.findOne({ email });

    if (developer) {
      developer.googleId = googleId;
      if (!developer.avatar) developer.avatar = avatar;
      await developer.save();

      return done(null, developer);
    }

    // 3️⃣ Otherwise create new account
    developer = await Developer.create({
      email,
      googleId,
      avatar,
      name: profile.displayName
    });

    return done(null, developer);

  } catch (err) {
    return done(err, null);
  }
}));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {

    const githubId = profile.id;
    const email = profile.emails?.[0]?.value; // may be undefined
    const avatar = profile.photos?.[0]?.value;

    // 1️⃣ Already linked?
    let developer = await Developer.findOne({ githubId });
    if (developer) return done(null, developer);
    
    // 2️⃣ If email exists, link account
    if (email) {
      developer = await Developer.findOne({ email });
      if (developer) {
        developer.githubId = githubId;
        if (!developer.avatar) developer.avatar = avatar;
        await developer.save();
        return done(null, developer);
      }
    }

    // 3️⃣ Create new account
    developer = await Developer.create({
      email,
      githubId,
      avatar,
      name: profile.displayName || profile.username
    });

    return done(null, developer);

  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((developer, done) => {
  done(null, developer.id);
});

passport.deserializeUser(async (id, done) => {
  const developer = await Developer.findById(id);
  done(null, developer);
});

module.exports = passport;

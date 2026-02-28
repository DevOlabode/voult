const mongoose = require('mongoose');

const OAuthAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  app: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App',
    required: true,
    index: true
  },

  provider: {
    type: String,
    required: true,
    enum: ['google', 'github', 'facebook', 'linkedin', 'apple', 'microsoft'],
    index: true
  },

  providerUserId: {
    type: String,
    required: true
  },

  profile: {
    email: String,
    name: String,
    avatar: String,
    raw: mongoose.Schema.Types.Mixed // optional full provider payload
  },

  accessToken: String,
  refreshToken: String,
  tokenExpiresAt: Date,

  deletedAt: Date
}, { timestamps: true });

// Prevent duplicate provider account globally (provider + providerUserId + app)
OAuthAccountSchema.index(
  { provider: 1, providerUserId: 1, app: 1 },
  { unique: true }
);

// Prevent linking same provider twice to same user
OAuthAccountSchema.index(
  { user: 1, provider: 1 },
  { unique: true }
);

module.exports = mongoose.model('OAuthAccount', OAuthAccountSchema);

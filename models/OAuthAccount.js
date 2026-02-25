const mongoose = require('mongoose');

const oauthAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  provider: {
    type: String,
    required: true,
    enum: ['google', 'facebook', 'linkedin', 'apple', 'microsoft'],
    index: true
  },
  providerUserId: {
    type: String,
    required: true
  },
  accessToken: String,
  refreshToken: String
}, { timestamps: true });

// Prevent duplicate provider account globally
oauthAccountSchema.index(
  { provider: 1, providerUserId: 1 },
  { unique: true }
);

// Prevent linking same provider twice to same user
oauthAccountSchema.index(
  { userId: 1, provider: 1 },
  { unique: true }
);

module.exports = mongoose.model('OAuthAccount', oauthAccountSchema);
const mongoose = require('mongoose');
const {Schema} = mongoose;
const crypto = require('crypto');

const magicLinkTokenSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  app :{
    type : Schema.Types.ObjectId,
    ref : 'App',
    required : true
  },
  tokenHash: {
    type: String,
    required: true,
    select: false
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  usedAt: Date,
  redirectUri: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Index for cleanup and lookup
magicLinkTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
magicLinkTokenSchema.index({ email: 1 });

// Static method to hash tokens
magicLinkTokenSchema.statics.hashToken = function(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

// Atomic claim: validates + marks as used in a single DB operation
magicLinkTokenSchema.statics.claimValidToken = async function(rawToken) {
  const tokenHash = this.hashToken(rawToken);

  const now = new Date();

  // findOneAndUpdate is atomic: the first caller wins
  const tokenDoc = await this.findOneAndUpdate(
    {
      tokenHash,
      used: false,
      expiresAt: { $gt: now }
    },
    {
      $set: {
        used: true,
        usedAt: now
      }
    },
    {
      new: true
    }
  ).select('+tokenHash');

  if (!tokenDoc) {
    return null;
  }

  return tokenDoc;
};

module.exports = mongoose.models.MagicLinkToken || mongoose.model('MagicLinkToken', magicLinkTokenSchema);

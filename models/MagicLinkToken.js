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

// Static method to find and validate a token
magicLinkTokenSchema.statics.findAndValidateToken = async function(rawToken) {
  const tokenHash = this.hashToken(rawToken);
  const tokenDoc = await this.findOne({ tokenHash, used: false }).select('+tokenHash');
  
  if (!tokenDoc) {
    return null;
  }
  
  if (tokenDoc.expiresAt < new Date()) {
    // Token expired, delete it
    await this.deleteOne({ _id: tokenDoc._id });
    return null;
  }
  
  return tokenDoc;
};

// Method to mark token as used
magicLinkTokenSchema.methods.markAsUsed = function() {
  this.used = true;
  this.usedAt = new Date();
  return this.save();
};

module.exports = mongoose.models.MagicLinkToken || mongoose.model('MagicLinkToken', magicLinkTokenSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;
const crypto = require('crypto');

const EndUserSchema = new Schema(
  {
    app: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'App',
      required: true
    },

    email: {
      type: String,
      required: true
    },

    passwordHash: {
      type: String,
      select: false
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    emailVerificationToken: String,

    emailVerificationExpires: Date,

    tokenVersion: {
      type: Number,
      default: 0
    },

    lastLoginAt: Date,
    deletedAt: Date
  },
  { timestamps: true }
);


/* Ensure email is unique PER app */
EndUserSchema.index({ app: 1, email: 1 }, { unique: true });

/* Password helpers */
EndUserSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};

EndUserSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

EndUserSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  this.emailVerificationExpires = Date.now() + 1000 * 60 * 60 * 24; // 24h

  return token; 
};

module.exports = mongoose.models.EndUser || mongoose.model('EndUser', EndUserSchema);
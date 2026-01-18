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

    isActive : {
      type : Boolean,
      deffault : true
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

    resetPasswordToken: {
      type: String,
      select: false
    },
    
    resetPasswordExpires: Date,
    
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

/* Email Verification Methods */
EndUserSchema.methods.generateEmailVerificationToken = async function () {
  const rawToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  await this.save(); 

  return rawToken;
};

EndUserSchema.methods.generatePasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  this.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 minutes

  return rawToken;
};



module.exports = mongoose.models.EndUser || mongoose.model('EndUser', EndUserSchema);
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
      default : true
    },

    disabledAt : {
      type : Date,
    },

    disabledReason : {
      type : String,
    },

    fullName : {
      type : String,
      trim : true,
      maxlength : 100
    },

    email: {
      type: String,
      required: false
    },

    passwordHash: {
      type: String,
      select: false
    },

    googleId: {
      type: String,
      index: true
    },

    githubId: {
      type: String,
      index: true
    },

    facebookId: {
      type: String,
      index: true
    },

    authProvider: {
      type: String,
      enum: ['local', 'google', 'github', 'facebook'],
      default: 'local',
      required : true
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

    deletedAt: Date,

    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    
    lockUntil: {
      type: Date,
      default: null
    }

  },
  { timestamps: true }
);


/* Ensure email is unique per app when present; sparse allows multiple null (e.g. Facebook users without email) */
EndUserSchema.index({ app: 1, email: 1 }, { unique: true, sparse: true });

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

EndUserSchema.virtual('isLocked').get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});


module.exports = mongoose.models.EndUser || mongoose.model('EndUser', EndUserSchema);
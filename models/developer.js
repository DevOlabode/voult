const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
const passportLocalMongoose = plm.default || plm;
const crypto = require('crypto');

const {Schema} = mongoose;

const developerSchema = new Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    avatar: String,
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    allowedOrigins: [
      {
        type: String,
      },
    ],

    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    isVerified: {
      type: Boolean,
      default: false
    },
  
    verifyToken: String,
    verifyTokenExpires: Date,


    lastLoginAt: Date,
  },
  {
    timestamps: true,
  }
);

developerSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  usernameLowerCase: true,
  errorMessages: {
    UserExistsError: 'A developer with this email already exists',
  },
});
  
module.exports = mongoose.model('Developer', developerSchema);
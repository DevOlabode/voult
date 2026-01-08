const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
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

    apiKey: {
      type: String,
      unique: true,
      index: true,
    },

    apiKeyActive: {
      type: Boolean,
      default: true,
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

    lastLoginAt: Date,
  },
  {
    timestamps: true,
  }
);

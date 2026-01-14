const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

const EndUserSchema = new Schema(
  {
    app: {
      type: Schema.Types.ObjectId,
      ref: 'App',
      required: true,
      index: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true
    },

    passwordHash: {
      type: String,
      required: true,
      select: false
    },

    emailVerified: {
      type: Boolean,
      default: false
    },

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

module.exports = mongoose.models.EndUser || mongoose.model('EndUser', EndUserSchema);
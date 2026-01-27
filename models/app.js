const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const AppSchema = new mongoose.Schema({
  name: { type: String, required: true },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Developer',
    required: true
  },

  description: String,

  // 🔐 CALLBACK ALLOWLIST
  allowedCallbackUrls: {
    type: [String],
    default: []
  },

  isActive: {
    type: Boolean,
    default: true
  },

  clientId: {
    type: String,
    unique: true,
    index: true
  },

  usage: {
    totalRegistrations: { type: Number, default: 0 },
    totalLogins: { type: Number, default: 0 }
  },

googleOAuth: {
  enabled: {
    type: Boolean,
    default: false,
  },
  clientId: {
    type: String,
  },
  clientSecret: {
    type: String,
    select: false,
  },
  redirectUri: {
    type: String,
  },
},


  deletedAt: Date
}, { timestamps: true });

/* ================= METHODS ================= */

AppSchema.methods.generateClientId = function () {
  this.clientId = `app_${crypto.randomBytes(12).toString('hex')}`;
  return this.clientId;
};

AppSchema.methods.generateClientSecret = function () {
  const secret = crypto.randomBytes(32).toString('hex');
  this.clientSecretHash = bcrypt.hashSync(secret, 12);
  return secret;
};

AppSchema.methods.verifyClientSecret = async function (clientSecret) {
  console.log('verifyClientSecret called with:', {
    clientSecret,
    hasHash: !!this.clientSecretHash
  });

  return bcrypt.compare(clientSecret, this.clientSecretHash);
};


module.exports = mongoose.models.App || mongoose.model('App', AppSchema);

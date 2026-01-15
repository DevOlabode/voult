// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const crypto = require('crypto');
// const bcrypt = require('bcrypt');

// const AppSchema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true
//     },

//     owner: {
//       type: Schema.Types.ObjectId,
//       ref: 'Developer',
//       required: true
//     },

//     description: String,

//     callbackUrl: String,

//     isActive: {
//       type: Boolean,
//       default: true
//     },

//     //  App credentials
//     clientId: {
//       type: String,
//       unique: true,
//       index: true
//     },

//     clientSecretHash: {
//       type: String,
//       select: false
//     },

//     deletedAt: Date
//   },
//   { timestamps: true }
// );

// AppSchema.methods.generateClientId = function () {
//     const id = `app_${crypto.randomBytes(12).toString('hex')}`;
//     this.clientId = id;
//     return id;
// };

// AppSchema.methods.generateClientSecret = function () {
//   const secret = crypto.randomBytes(32).toString('hex');
//   this.clientSecretHash = bcrypt.hashSync(secret, 12);
//   return secret; 
// };

// AppSchema.methods.verifyClientSecret = async function (secret) {
//   return bcrypt.compare(secret, this.clientSecretHash);
// };

// module.exports = mongoose.models.App || mongoose.model('App', AppSchema);

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

  clientSecretHash: {
    type: String,
    select: false
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

AppSchema.methods.verifyClientSecret = function (secret) {
  return bcrypt.compare(secret, this.clientSecretHash);
};

module.exports = mongoose.models.App || mongoose.model('App', AppSchema);

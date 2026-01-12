const mongoose = require('mongoose');
const { Schema } = mongoose;

const crypto = require('crypto');

const AppSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Developer',
      required: true
    },

    description: String,

    callbackUrl: String,

    isActive: {
      type: Boolean,
      default: true
    },

    //  App credentials
    clientId: {
      type: String,
      unique: true,
      index: true
    },

    clientSecretHash: {
      type: String,
      select: false
    },

    deletedAt: Date
  },
  { timestamps: true }
);

AppSchema.methods.generateClientId = function () {
    const id = `app_${crypto.randomBytes(12).toString('hex')}`;
    this.clientId = id;
    return id;
};

AppSchema.methods.generateClientSecret = function () {
    const secret = `sk_${crypto.randomBytes(32).toString('hex')}`;
  
    const hash = crypto
      .createHash('sha256')
      .update(secret)
      .digest('hex');
  
    this.clientSecretHash = hash;
  
    return secret;
};
  
AppSchema.methods.verifyClientSecret = function (secret) {
    const hash = crypto
      .createHash('sha256')
      .update(secret)
      .digest('hex');
  
    return hash === this.clientSecretHash;
};  

module.exports = mongoose.model('App', AppSchema);
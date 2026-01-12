const mongoose = require('mongoose');
const { Schema } = mongoose;

const AppSchema = new Schema({
    name: {
        type : String,
        required : true
    },
    owner: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Developer'
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    description : {
        type : String,
        required : false
    },
    callbackUrl : {
        type : String,
        required : false
    },
    
    deletedAt : Date
},{timestamps : true});

AppSchema.methods.generateApiKey = function () {
    const key = crypto.randomBytes(32).toString('hex');
    this.apiKey = key;
    return key;
};

module.exports = mongoose.model('App', AppSchema);
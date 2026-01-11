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
    }
},{timestamps : true});

module.exports = mongoose.model('App', AppSchema);
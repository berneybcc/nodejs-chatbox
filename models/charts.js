var mongoose = require('mongoose');
const { Schema } = mongoose;

var ChartsSchema = new Schema({
    id_user:String,
    description_question:String,
    total:Number
});

module.exports = mongoose.model('charts', ChartsSchema);
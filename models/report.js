var mongoose = require('mongoose');
const { Schema } = mongoose;

var ReportSchema = new Schema({
    id_user:String,
    uid_question:String,
    description_question:String,
    date:Date
});

module.exports = mongoose.model('report', ReportSchema);
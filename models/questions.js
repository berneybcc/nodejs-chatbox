var mongoose = require('mongoose');
const { Schema } = mongoose;

var QuestionsSchema = new Schema({
    num : Number,
    description: String,
    relation:Array
});

module.exports = mongoose.model('questions', QuestionsSchema);
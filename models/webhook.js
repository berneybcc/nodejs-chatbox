var mongoose = require('mongoose');
const { Schema } = mongoose;

var WebhookSchema = new Schema({
    event:Object,
    date:Date
});

module.exports = mongoose.model('webhook', WebhookSchema);
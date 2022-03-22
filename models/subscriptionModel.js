let mongoose = require('mongoose');
let timestamps = require('mongoose-timestamp');

let subscriptionSchema = new mongoose.Schema({
    title: String,
    type: String,
    months: Number,
    amount: Number,
    currency: String,
    benefits: Array,
    delete_status: Boolean
});

subscriptionSchema.plugin(timestamps);
mongoose.model('subscription', subscriptionSchema);
module.exports = mongoose.model('subscription');
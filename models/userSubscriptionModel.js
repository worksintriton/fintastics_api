let mongoose = require('mongoose');
let timestamps = require('mongoose-timestamp');

let userSubscriptionSchema = new mongoose.Schema({
    userid: String,
    subscriptionid: String,
    startdate: Date,
    enddate: Date,
    amount: Number,
    expired: Boolean,
    payment_ref_id: String,
    delete_status: Boolean
});

userSubscriptionSchema.plugin(timestamps);
mongoose.model('userSubscription', userSubscriptionSchema);
module.exports = mongoose.model('userSubscription');
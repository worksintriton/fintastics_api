var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

var currencySchema = new mongoose.Schema({
  currency: String,
  date_and_time: String,
  delete_status: Boolean,
});
currencySchema.plugin(timestamps);
mongoose.model('currency', currencySchema, 'currency');
module.exports = mongoose.model('currency');
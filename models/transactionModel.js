var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema; 

var transactionSchema = new mongoose.Schema({
  transaction_date :  Date,
  transaction_type : String,
  transaction_desc : String,
  transaction_sub_desc : String,
  transaction_way : String,
  transaction_amount : Number,
  transaction_balance : Number,
  transaction_currency_type : String,
  system_date : Date,
  user_id : String,
  parent_code : String,
  delete_status : Boolean,
});
transactionSchema.plugin(timestamps);
mongoose.model('transaction', transactionSchema);
module.exports = mongoose.model('transaction');
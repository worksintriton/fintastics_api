var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

var transactionSchema = new mongoose.Schema({
  transaction_date: Date,
  transaction_type: String,
  transaction_desc: {
    type: Schema.Types.ObjectId,
    ref: 'desc_types'
  },
  transaction_sub_desc: {
    type: Schema.Types.ObjectId,
    ref: 'sub_desc_types'
  },
  transaction_way: String,
  transaction_amount: Number,
  transaction_balance: Number,
  transaction_currency_type: String,
  transaction_currency_symbol: String,
  system_date: Date,
  user_id: String,
  parent_code: String,
  delete_status: Boolean,
  transaction_budget_id: String
});
transactionSchema.plugin(timestamps);
mongoose.model('transaction', transactionSchema);
module.exports = mongoose.model('transaction');
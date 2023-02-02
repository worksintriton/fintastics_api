var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema; 

var budgetSchema = new mongoose.Schema({  
  budget_title :  {
    type: String,
    required: [true, "budget_title is mandatory"]
  },
  //budget_type : String,
  budget_period_type : {
    type: String,
    required: [true, "budget_period_type is mandatory"]
  },
  budget_amount : {
    type: Number,
    required: [true, "budget_amount is mandatory"]
  },
  budget_currency : String,
  budget_currency_symbol: String,
  budget_cat : Array,
  budget_account :Array,
  budget_start_date : {
    type: Date,
    required: [true, "budget_start_date is mandatory"]
  },
  budget_end_date : {
    type: Date,
    required: [true, "budget_end_date is mandatory"]
  },
  //budget_value : Number,
  //budget_head_type : Boolean,
  budget_notification : Boolean,
  delete_status : Boolean,
  budget_userid: String,
  budget_cat_all : Boolean,
  budget_account_all : Boolean,
  budget_status: String
});
budgetSchema.plugin(timestamps);
mongoose.model('budget', budgetSchema);
module.exports = mongoose.model('budget');
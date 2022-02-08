var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema; 

var budgetSchema = new mongoose.Schema({  
  budget_title :  String,
  //budget_type : String,
  budget_period_type : String,
  budget_amount : Number,
  budget_currency : String,
  budget_cat : Array,
  budget_account :Array,
  budget_start_date : Date,
  budget_end_date : Date,
  //budget_value : Number,
  //budget_head_type : Boolean,
  budget_notification : Boolean,
  delete_status : Boolean,
});
budgetSchema.plugin(timestamps);
mongoose.model('budget', budgetSchema);
module.exports = mongoose.model('budget');
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema; 

var payment_typeSchema = new mongoose.Schema({  
  payment_type :  String,
  date_and_time : String,
  delete_status : Boolean,
});
payment_typeSchema.plugin(timestamps);
mongoose.model('payment_type', payment_typeSchema);
module.exports = mongoose.model('payment_type');
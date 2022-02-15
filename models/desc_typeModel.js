var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema; 

var desc_typeSchema = new mongoose.Schema({  
  desc_type :  String,
  date_and_time : String,
  delete_status : Boolean,
  icon: String
});
desc_typeSchema.plugin(timestamps);
mongoose.model('desc_type', desc_typeSchema);
module.exports = mongoose.model('desc_type');
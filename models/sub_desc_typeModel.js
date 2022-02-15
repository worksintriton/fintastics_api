var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema; 

var sub_desc_typeSchema = new mongoose.Schema({  
  desc_type_id  : String,
  sub_desc_type : String,
  date_and_time : String,
  delete_status : Boolean,
  icon: String
});
sub_desc_typeSchema.plugin(timestamps);
mongoose.model('sub_desc_type', sub_desc_typeSchema);
module.exports = mongoose.model('sub_desc_type');
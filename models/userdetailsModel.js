var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema; 

var userdetailsSchema = new mongoose.Schema({
  
  username:  String,
  password : String,
  user_email : String,
  first_name : String,
  last_name: String,
  dob: String,
  contact_number : String,
  fb_token : String,
  mobile_type : String,
  delete_status : Boolean,
  account_type : String,
  roll_type : String,
  parent_of: String,
  parent_code : String,
  profile_img : String,
  currency : String
});
userdetailsSchema.plugin(timestamps);
mongoose.model('userdetails', userdetailsSchema);
module.exports = mongoose.model('userdetails');

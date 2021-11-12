var mongoose = require('mongoose');

const Schema = mongoose.Schema; 

var userdetailsSchema = new mongoose.Schema({ 

  first_name:  String,
  last_name : String,
  user_email : String,
  user_phone : String,
  date_of_reg : String,
  otp : Number,
  user_type : Number,
  user_status : String,
  fb_token : String,
  device_id : String,
  device_type : String,


});

mongoose.model('userdetails', userdetailsSchema);
module.exports = mongoose.model('userdetails');

var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema; 

var userdetailsSchema = new mongoose.Schema({
  
  username:  {
    type: String,
    required: [true, "username is mandatory"],
    minLength: 1,
  },
  password : {
    type: String,
    required: [true, "password is mandatory"],
    minLength: 1,
  },
  user_email : {
    type: String,
    required: [true, "user_email is mandatory"],
    minLength: 1,
  },
  first_name : String,
  last_name: String,
  dob: String,
  contact_number : String,
  fb_token : String,
  mobile_type : String,
  delete_status : Boolean,
  account_type : {
    type: String,
    required: [true, "account_type is mandatory"]
  },
  roll_type : String,
  parent_of: String,
  parent_code : String,
  profile_img : String,
  currency : {
    type: String,
    required: [true, "currency is mandatory"]
  },
  currency_symbol: {
    type: String,
    required: [true, "currency_symbol is mandatory"]
  }
});
userdetailsSchema.plugin(timestamps);
mongoose.model('userdetails', userdetailsSchema);
module.exports = mongoose.model('userdetails');

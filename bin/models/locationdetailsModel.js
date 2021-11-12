var mongoose = require('mongoose');

const Schema = mongoose.Schema; 

var locationdetailsSchema = new mongoose.Schema({  
  user_id  : String,
  location_state : String,
  location_country : String,
  location_city : String,
  location_pin : String,
  location_address : String,
  location_lat : Number,
  location_long : Number,
  location_title : String,
  location_nickname : String,
  default_status : Boolean,
  date_and_time : String,
});

mongoose.model('locationdetails', locationdetailsSchema);

module.exports = mongoose.model('locationdetails');
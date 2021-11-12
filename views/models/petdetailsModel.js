var mongoose = require('mongoose');

const Schema = mongoose.Schema; 

var petdetailsSchema = new mongoose.Schema({  
  user_id  : String,
  pet_img : String,
  pet_name : String,
  pet_type : String,
  pet_breed : String,
  pet_gender : String,
  pet_color : String,
  pet_weight : Number,
  pet_age : Number,
  vaccinated : Boolean,
  last_vaccination_date : String,
  default_status : Boolean,
  date_and_time : String,
});

mongoose.model('petdetails', petdetailsSchema);

module.exports = mongoose.model('petdetails');
var mongoose = require('mongoose');

const Schema = mongoose.Schema; 

var doctordetailsSchema = new mongoose.Schema({  
  user_id  : String,
  dr_title : String,
  dr_name : String,
  clinic_name : String,
  clinic_loc : String,
  clinic_lat : Number,
  clinic_long : Number,
  education_details : Array,
  experience_details : Array,
  specialization : Array,
  pet_handled : Array,
  clinic_pic : Array,
  certificate_pic :  Array,
  govt_id_pic : Array,
  photo_id_pic : Array,
  profile_status : Boolean,
  profile_verification_status : String,
  date_and_time : String,
});

mongoose.model('doctordetails', doctordetailsSchema);

module.exports = mongoose.model('doctordetails');
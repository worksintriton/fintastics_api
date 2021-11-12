var mongoose = require('mongoose');

const Schema = mongoose.Schema; 

var vendordetailsSchema = new mongoose.Schema({ 
  
  user_id :  String,
  bus_name : String,
  bus_email : String,
  bussiness : String,
  bus_phone : Number,
  bus_regis : String,
  gallery : Array,
  photo_id : Array,
  govt_id : Array,
  certificate : Array,
  date_and_time : String,

});

mongoose.model('vendordetails', vendordetailsSchema);
module.exports = mongoose.model('vendordetails');

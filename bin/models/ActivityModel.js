var mongoose = require('mongoose');

const Schema = mongoose.Schema; 

var ActivitySchema = new mongoose.Schema({  
  user_type:  String,
  user_name : String,
  user_mobile : String,
  user_id : String,
  title : String,
  describ : String,
  date_and_time : String
});
mongoose.model('Activity', ActivitySchema);

module.exports = mongoose.model('Activity');

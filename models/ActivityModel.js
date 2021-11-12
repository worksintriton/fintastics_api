var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema; 

var ActivitySchema = new mongoose.Schema({  
  user_type:  String,
  user_name : String,
  user_mobile : String,
  user_id : String,
  title : String,
  describ : String,
  date_and_time : String,
    delete_status : Boolean,
});
ActivitySchema.plugin(timestamps);
mongoose.model('Activity', ActivitySchema);
module.exports = mongoose.model('Activity');

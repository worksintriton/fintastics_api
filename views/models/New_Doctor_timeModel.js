var mongoose = require('mongoose');
const Schema = mongoose.Schema; 
var New_DoctortimeSchema = new mongoose.Schema({  
  
  Doctor_name: String,

  user_id: String,

  Doctor_date_time: Array,

  Doctor_time: Array,

  Update_date : String


});
mongoose.model('New_Doctortime', New_DoctortimeSchema);

module.exports = mongoose.model('New_Doctortime');

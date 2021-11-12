var mongoose = require('mongoose');

const Schema = mongoose.Schema; 

var HolidaySchema = new mongoose.Schema({  
  user_id : String,
  Date : String,
});
mongoose.model('Holiday', HolidaySchema);

module.exports = mongoose.model('Holiday');
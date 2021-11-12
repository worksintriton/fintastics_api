var mongoose = require('mongoose');

const Schema = mongoose.Schema; 

var pettypeSchema = new mongoose.Schema({  
  pet_type_title:  String,
  pet_type_value : Number,
  date_and_time : String
});
mongoose.model('pettype', pettypeSchema);

module.exports = mongoose.model('pettype');
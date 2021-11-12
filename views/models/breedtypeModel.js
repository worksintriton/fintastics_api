var mongoose = require('mongoose');

const Schema = mongoose.Schema; 

var breedtypeSchema = new mongoose.Schema({  
  pet_type_id:  String,
  pet_breed : String,
  pet_breed_value : Number,
  date_and_time : String
});
mongoose.model('breedtype', breedtypeSchema);

module.exports = mongoose.model('breedtype');
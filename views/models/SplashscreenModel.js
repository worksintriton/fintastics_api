var mongoose = require('mongoose');

const Schema = mongoose.Schema; 

var SplashscreenSchema = new mongoose.Schema({  
  img_path:  String,
  img_title : String,
  img_index : Number,
  show_status : Boolean,
  date_and_time : String
});
mongoose.model('Splashscreen', SplashscreenSchema);

module.exports = mongoose.model('Splashscreen');
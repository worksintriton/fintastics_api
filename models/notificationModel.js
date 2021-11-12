var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema; 

var notificationSchema = new mongoose.Schema({  
  user_id :  String,
  notify_title : String,
  notify_descri : String,
  notify_img : String,
  notify_time : String,
  date_and_time : String,
  delete_status : Boolean,
});
notificationSchema.plugin(timestamps);
mongoose.model('notification', notificationSchema);
module.exports = mongoose.model('notification');
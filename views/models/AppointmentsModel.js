var mongoose = require('mongoose');

const Schema = mongoose.Schema; 

var appointmentSchema = new mongoose.Schema({  
  doctor_id : {  
       type: Schema.Types.ObjectId,
       ref: 'userdetails',
      },
  appointment_UID: String,
  booking_date: String,
  booking_time: String,
  booking_date_time : String,
  communication_type : String,
  msg_id : String,
  video_id : String,
  user_id : {  
       type: Schema.Types.ObjectId,
       ref: 'userdetails',
      },
  pet_id : {  
       type: Schema.Types.ObjectId,
       ref: 'petdetails',
      },

   // pet_record :
   // {  
   //     type: Schema.Types.ObjectId,
   //     ref: 'Payment',
   //    }  

   
  problem_info : String,
  doc_attched : Array,
  appoinment_status : String,
  start_appointment_status : String,
  end_appointment_status : String,
  doc_feedback : String,
  doc_rate : String,
  user_feedback : String,
  user_rate : String,
  display_date : String,
  server_date_time : String,
  payment_id : String,
  payment_method : String,
  prescription_details : String,
  vaccination_details : String,
  appointment_types : String,
  allergies : String,
  amount : String
});
mongoose.model('appointment', appointmentSchema);

module.exports = mongoose.model('appointment');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var AppointmentsModel = require('./../models/AppointmentsModel');


router.post('/mobile/create', async function(req, res) {
  try{
        let display_date = req.body.date_and_time;

        let Appointmentid = "PET-" + new Date().getTime();
        await AppointmentsModel.create({
            doctor_id : req.body.doctor_id,
            appointment_UID : Appointmentid,
            booking_date : req.body.booking_date,
            booking_time : req.body.booking_time,
            booking_date_time : req.body.booking_date_time,
            communication_type : req.body.communication_type,
            msg_id : Appointmentid,
            video_id : req.body.video_id,
            user_id : req.body.user_id,
            pet_id : req.body.pet_id,
            problem_info : req.body.problem_info,
            doc_attched : req.body.doc_attched,
            appoinment_status : "Incomplete",
            start_appointment_status : "Not Started",
            end_appointment_status : "Not End",
            doc_feedback : req.body.doc_feedback,
            doc_rate : req.body.doc_rate,
            user_feedback : req.body.user_feedback,
            user_rate : req.body.user_rate,
            display_date : req.body.display_date,
            server_date_time : req.body.server_date_time,
            payment_method : req.body.payment_method,
            prescription_details : "",
            vaccination_details :"",
            appointment_types : req.body.appointment_types,
            allergies : req.body.allergies,
            // calculating_date : ,
            payment_id : req.body.payment_id,
            amount : req.body.amount
        }, 
        function (err, user) {
          console.log(user)
        res.json({Status:"Success",Message:"Appointment Added successfully", Data : user ,Code:200}); 
        });
}
catch(e){
      res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
}
});


router.post('/mobile/doc_getlist/newapp', function (req, res) {
        AppointmentsModel.find({doctor_id:req.body.doctor_id,appoinment_status:"Incomplete"}, function (err, StateList) {
          console.log(StateList);
           StateList.sort(function compare(a, b) {
              console.log(a.server_date_time);
              console.log(b.server_date_time);
               var dateA = new Date(a.server_date_time);
               var dateB = new Date(b.server_date_time);
               console.log(dateA,dateB);
               return dateB - dateA;
               });
          res.json({Status:"Success",Message:"New Appointment List", Data : StateList ,Code:200});
        }).populate('user_id doctor_id pet_id');
});


router.post('/mobile/doc_getlist/comapp', function (req, res) {
        AppointmentsModel.find({doctor_id:req.body.doctor_id,appoinment_status:"Completed"}, function (err, StateList) {
          console.log(StateList);
           StateList.sort(function compare(a, b) {
              console.log(a.server_date_time);
              console.log(b.server_date_time);
               var dateA = new Date(a.server_date_time);
               var dateB = new Date(b.server_date_time);
               console.log(dateA,dateB);
               return dateB - dateA;
               });
          res.json({Status:"Success",Message:"Completed Appointment List", Data : StateList ,Code:200});
        }).populate('user_id doctor_id pet_id');
});



router.post('/mobile/doc_getlist/missapp', function (req, res) {
        AppointmentsModel.find({doctor_id:req.body.doctor_id,appoinment_status:"Missed"}, function (err, StateList) {
          console.log(StateList);
           StateList.sort(function compare(a, b) {
              console.log(a.server_date_time);
              console.log(b.server_date_time);
               var dateA = new Date(a.server_date_time);
               var dateB = new Date(b.server_date_time);
               console.log(dateA,dateB);
               return dateB - dateA;
               });
          res.json({Status:"Success",Message:"Missed Appointment List", Data : StateList ,Code:200});
        }).populate('user_id doctor_id pet_id');
});


router.get('/deletes', function (req, res) {
      AppointmentsModel.remove({}, function (err, user) {
          if (err) return res.status(500).send("There was a problem deleting the user.");
             res.json({Status:"Success",Message:"Appointment Deleted", Data : {} ,Code:200});     
      });
});


router.post('/getlist_id', function (req, res) {
        AppointmentsModel.find({Person_id:req.body.Person_id}, function (err, StateList) {
          res.json({Status:"Success",Message:"Appointment List", Data : StateList ,Code:200});
        });
});



router.get('/getlist', function (req, res) {
        AppointmentsModel.find({}, function (err, Functiondetails) {
          res.json({Status:"Success",Message:"Appointment Details", Data : Functiondetails ,Code:200});
        });
});


router.get('/mobile/getlist', function (req, res) {
        AppointmentsModel.find({}, function (err, Functiondetails) {
          let a = {
            usertypedata : Functiondetails
          }
          res.json({Status:"Success",Message:"Appointment Details", Data : a ,Code:200});
        });
});


router.post('/mobile/doctor/app_edit', function (req, res) {
        AppointmentsModel.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"Appointment Updated", Data : UpdatedDetails ,Code:200});
        });
});


router.post('/mobile/user/edit', function (req, res) {
        AppointmentsModel.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"Appointment Updated", Data : UpdatedDetails ,Code:200});
        });
});




router.post('/edit', function (req, res) {
        AppointmentsModel.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"Appointment Updated", Data : UpdatedDetails ,Code:200});
        });
});


// // DELETES A USER FROM THE DATABASE
router.post('/delete', function (req, res) {
      AppointmentsModel.findByIdAndRemove(req.body._id, function (err, user) {
          if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
          res.json({Status:"Success",Message:"Appointment Deleted successfully", Data : {} ,Code:200});
      });
});


module.exports = router;

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
const moment = require('moment');
//var VerifyToken = require('./VerifyToken');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var New_Doctor_time = require('./../models/New_Doctor_timeModel');
var date_datas = require('./date_datas.json');
var responseMiddleware = require('./../middlewares/response.middleware');
router.use(responseMiddleware());


router.post('/fetch_dates',async function(req, res) {
  var date_details = await New_Doctor_time.findOne({user_id:req.body.user_id});
  console.log(date_details);
  if(date_details == null){
    let Datass = [];
     if(req.body.types == 1){
             let a  = [
             {
              'Title' : 'Monday',
              'Time' : date_datas.onehour
             },
             {
              'Title' : 'Tuesday',
              'Time' : date_datas.onehour
             },
             {
              'Title' : 'Wednesday',
              'Time' : date_datas.onehour
             },
             {
              'Title' : 'Thursday',
              'Time' : date_datas.onehour
             },
             {
              'Title' : 'Friday',
              'Time' : date_datas.onehour
             },
             {
              'Title' : 'Saturday',
              'Time' : date_datas.onehour
             },
             {
              'Title' : 'Sunday',
              'Time' : date_datas.onehour
             }
             ];
             Datass =   a;
     }else if(req.body.types == 2){
             let a  = [
             {
              'Title' : 'Monday',
              'Time' : date_datas.thirtymin
             },
             {
              'Title' : 'Tuesday',
              'Time' : date_datas.thirtymin
             },
             {
              'Title' : 'Wednesday',
              'Time' : date_datas.thirtymin
             },
             {
              'Title' : 'Thursday',
              'Time' : date_datas.thirtymin
             },
             {
              'Title' : 'Friday',
              'Time' : date_datas.thirtymin
             },
             {
              'Title' : 'Saturday',
              'Time' : date_datas.thirtymin
             },
             {
              'Title' : 'Sunday',
              'Time' : date_datas.thirtymin
             }
             ];
             Datass = a;
     }else if(req.body.types == 3){
      let a  = [
             {
              'Title' : 'Monday',
              'Time' : date_datas.fiftymin
             },
             {
              'Title' : 'Tuesday',
              'Time' : date_datas.fiftymin
             },
             {
              'Title' : 'Wednesday',
              'Time' : date_datas.fiftymin
             },
             {
              'Title' : 'Thursday',
              'Time' : date_datas.fiftymin
             },
             {
              'Title' : 'Friday',
              'Time' : date_datas.fiftymin
             },
             {
              'Title' : 'Saturday',
              'Time' : date_datas.fiftymin
             },
             {
              'Title' : 'Sunday',
              'Time' : date_datas.fiftymin
             }
             ];
             Datass = a;
     }
     console.log(Datass);
    New_Doctor_time.create({
          Doctor_name: req.body.Doctor_name,
          user_id: req.body.user_id,
          Doctor_date_time: date_datas.Days,
          Doctor_time : Datass,
          Update_date: new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"})
        }, 
        function (err, user) {
          console.log(err)
          console.log(user);
          if (err) res.json({Status:"Failed",Message:"Failed to Insert", Data : {},Code:300});
          res.json({Status:"Success",Message:"Data Insert successfully", Data : user.Doctor_date_time,Code:200});
        });
  }else {
    res.json({Status:"Success",Message:"Data Fetched successfully", Data : date_details.Doctor_date_time,Code:200});
  }     
});


router.post('/get_time_Details',async function (req, res) {
  console.log(req.body);
  var date_details = await New_Doctor_time.findOne({user_id:req.body.user_id});
   if(req.body.Day.length !== 1){
       console.log('In');
       let datasss = [];
       if(24 == date_details.Doctor_time[0].Time.length){
            datasss = date_datas.onehour;
       }else if (48 == date_details.Doctor_time[0].Time.length){
            datasss = date_datas.thirtymin;
       }else{
            datasss = date_datas.fiftymin;
       }
      console.log(date_details.Doctor_time[0].Time.length);
      console.log(date_details.Doctor_time[0].Time);
    res.json({Status:"Success",Message:"Time list Details", Data : datasss ,Code:200});
   }else {
     let times = date_details.Doctor_time;
     for(let a  = 0 ; a < times.length ; a ++){
      if(times[a].Title == req.body.Day[0]){
        console.log(times[a].Time);
            console.log('Out');
         res.json({Status:"Success",Message:"Time list Details", Data : times[a].Time ,Code:200});
      }
     }
   } 
});



router.post('/update_doc_date',async function (req, res) {
    var date_details = await New_Doctor_time.findOne({user_id:req.body.user_id});
     console.log(date_details);
     for(let d = 0 ; d < req.body.days.length ; d ++)
     {
     for(let a = 0 ; a < date_details.Doctor_date_time.length ; a ++){
     	if(date_details.Doctor_date_time[a].Title == req.body.days[d]){
     		console.log("In");
           date_details.Doctor_date_time[a].Status  = true ;
           date_details.Doctor_time[a].Time = req.body.timing;
           console.log(date_details.Doctor_date_time[a].Title);
           console.log(date_details.Doctor_time[a].Time);
             const update = { Doctor_time : date_details.Doctor_time, Doctor_date_time:date_details.Doctor_date_time };
            var Corporatecodeupdate = await New_Doctor_time.findOneAndUpdate({user_id:req.body.user_id},update,{
            new: true
            });
     	}
     }
     if(d == req.body.days.length - 1){
     	res.json({Status:"Success",Message:"Calendar Details Updated", Data : {} ,Code:200});
     }  
     }    
});






router.post('/check', async function(req, res) {
  try{
    let a = [{
       "Total_time_slot" : req.body.Time
    }]
    let a1 = req.body.Time;
    var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
    console.log('India time: '+ (new Date(indiaTime)).toISOString());
    var testime = (new Date(indiaTime)).toISOString();
    console.log("data came from front end " , a1)
    let timeslot = a1[0].Total_time_slot;
    console.log("timeslot", timeslot)
    let timeslotpart = timeslot.slice(0,8).toString();
    let timeslotpart2 = timeslot.slice(11,19).toString();
    console.log("part 2....", timeslotpart2)
    var dt = moment(timeslotpart, ["h:mm A"]).format("HH:mm");
    var d2 = moment(timeslotpart2, ["h:mm A"]).format("HH:mm");
    console.log("d2 data", d2)
    console.log("time changed to 24 hours frontend" ,dt );
          let Doctor_ava_Date = req.body.Doctor_ava_Date;
          let totallist = Doctor_ava_Date + timeslot;
          let date = new Date();
          console.log("Current time", testime)
         const time = moment(testime);
         console.log("TESTTIME time", time)
         var finaltime = moment(time).format("HH:mm");
         console.log("time from the server " , finaltime)
         var finaldate = moment(new Date()).format("DD-MM-YYYY");
         console.log(finaldate);
        if(Doctor_ava_Date == finaldate){
          if(finaltime > dt && finaltime < d2){
          await Doctor_time.findOne({Doctor_email_id:req.body.Doctor_email_id,Doctor_ava_Date:req.body.Doctor_ava_Date,Time:req.body.Time}, function (err, Appointmentdetails) {
          console.log(Appointmentdetails);
          if(Appointmentdetails!== null){
            res.json({Status:"Failed",Message:"This time slot is already created",Data : {} ,Code:300});
          }
          else{
            res.json({Status:"Success",Message:"Available",Data : {} ,Code:200});
          }
          
        });
          }
          else{
            if(dt>finaltime){
              await Doctor_time.findOne({Doctor_email_id:req.body.Doctor_email_id,Doctor_ava_Date:req.body.Doctor_ava_Date,Time:req.body.Time}, function (err, Appointmentdetails) {
          console.log(Appointmentdetails);
          if(Appointmentdetails!== null){
            res.json({Status:"Failed",Message:"This time slot is already created",Data : {} ,Code:300});
          }
          else{
            res.json({Status:"Success",Message:"Available",Data : {} ,Code:200});
          }
          
        });
            }
           else{
             res.json({Status:"Failed",Message:"You have selected expired slot",Data : {} ,Code:300});
           }
          }
}
else{
  res.json({Status:"Success",Message:"Available",Data : {} ,Code:200});
}
}
catch(e){
  console.log(e)
      res.error(500, "Internal server error");
}
});

router.post('/testcheck', async function(req, res) {
  try{
    let a = [{
       "Total_time_slot" : req.body.Time
    }]
    let a1 = req.body.Time;
    var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
    console.log('India time: '+ (new Date(indiaTime)).toISOString());
    var testime = (new Date(indiaTime)).toISOString();
    console.log("data came from front end " , a1)
    let timeslot = a1[0].Total_time_slot;
    console.log("timeslot", timeslot)
    let timeslotpart = timeslot.slice(0,8).toString();
    let timeslotpart2 = timeslot.slice(11,19).toString();
    console.log("part 2....", timeslotpart2)
    var dt = moment(timeslotpart, ["h:mm A"]).format("HH:mm");
    var d2 = moment(timeslotpart2, ["h:mm A"]).format("HH:mm");
    console.log("d2 data", d2)
    console.log("time changed to 24 hours frontend" ,dt );
          let Doctor_ava_Date = req.body.Doctor_ava_Date;
          let totallist = Doctor_ava_Date + timeslot;
          let date = new Date();
          console.log("Current time", testime)
         const time = moment(testime);
         console.log("TESTTIME time", time)
         var finaltime = moment(time).format("HH:mm");
         console.log("time from the server " , finaltime)
         var finaldate = moment(new Date()).format("DD-MM-YYYY");
         console.log(finaldate);
        if(Doctor_ava_Date == finaldate){
          if(finaltime > dt && finaltime < d2){
             await Doctor_time.findOne({Doctor_email_id:req.body.Doctor_email_id,Doctor_ava_Date:req.body.Doctor_ava_Date,Time:req.body.Time}, function (err, Appointmentdetails) {
          console.log(Appointmentdetails);
          if(Appointmentdetails!== null){
            res.json({Status:"Failed",Message:"Slot not Available",Data : {} ,Code:300});
          }
          else{
            res.json({Status:"Success",Message:"Available",Data : {} ,Code:200});
          }
          
        });
          }
          else{
            if(dt>finaltime){
              await Doctor_time.findOne({Doctor_email_id:req.body.Doctor_email_id,Doctor_ava_Date:req.body.Doctor_ava_Date,Time:req.body.Time}, function (err, Appointmentdetails) {
          console.log(Appointmentdetails);
          if(Appointmentdetails!== null){
            res.json({Status:"Failed",Message:"Slot not Available",Data : {} ,Code:300});
          }
          else{
            res.json({Status:"Success",Message:"Available",Data : {} ,Code:200});
          }
          
        });
            }
           else{
             res.json({Status:"Failed",Message:"Invalid time slot",Data : {} ,Code:300});
           }
          }
}
}
catch(e){
  console.log(e)
      res.error(500, "Internal server error");
}
});

router.post('/avtime', async function(req, res) {
  try{
    let a = req.body.Time;
    let timeslot = a[0].Total_time_slot;
    let timeslotpart = timeslot.slice(0,8)
    console.log(timeslotpart);
    let Doctor_ava_Date = req.body.Doctor_ava_Date;
    let totallist = Doctor_ava_Date + timeslot;
     let date = new Date();
         const time = moment(date);
         var finaltime = moment(new Date()).format("hh:mm A");
         var finaldate = moment(new Date()).format("DD-MM-YYYY");
        console.log(finaldate);
        if(Doctor_ava_Date < finaldate){
         
             res.json({Status:"Failed",Message:"Time slot expired",Data : {} ,Code:300}); 
          
        }
        else if(timeslotpart <= finaltime){
            res.json({Status:"Failed",Message:"Time slot expired",Data : {} ,Code:300}); 
        }
    // var today = new Date();
          else{
            res.json({Status:"sucess",Message:"Available",Data : {} ,Code:300}); 
          }
      
}
catch(e){
      console.log(e)
      res.error(500, "Internal server error");
}
});
router.get('/deletes', function (req, res) {
      New_Doctor_time.remove({}, function (err, user) {
      if (err) return res.status(500).send("There was a problem deleting the user.");
      res.json({Status:"Success",Message:"Doctor_time Details Deleted", Data : {} ,Code:200});     
      });
});

router.post('/doctor_date_avl', function (req, res) {
        Doctor_time.find({Doctor_email_id:req.body.Doctor_email_id,Doctor_ava_Date:req.body.Doctor_ava_Date}, function (err, doctors) {
            if (err) return res.status(500).send("There was a problem finding the Doctors.");
            if(doctors.length == 0){
                res.json({Status:"Failed",Message:"Doctor Not Available today Please select another Date", Data : [] ,Code:300});
                }else {
    let timeslot = doctors[0].Time[0].Total_time_slot;
    var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
    console.log('India time: '+ (new Date(indiaTime)).toISOString());
    var testime = (new Date(indiaTime)).toISOString();
    console.log("timeslot", timeslot)
    let timeslotpart = timeslot.slice(0,8).toString();
    let timeslotpart2 = timeslot.slice(11,19).toString();
    console.log("part 2....", timeslotpart2)
    var dt = moment(timeslotpart, ["h:mm A"]).format("HH:mm");
    var d2 = moment(timeslotpart2, ["h:mm A"]).format("HH:mm");
    console.log("d2 data", d2)
    console.log("time changed to 24 hours frontend" ,dt );
          let Doctor_ava_Date = req.body.Doctor_ava_Date;
          let totallist = Doctor_ava_Date + timeslot;
          let date = new Date();
          console.log("Current time", testime)
         const time = moment(testime);
         console.log("TESTTIME time", time)
         var finaltime = moment(time).format("HH:mm");
         console.log("time from the server " , finaltime)
         var finaldate = moment(new Date()).format("DD-MM-YYYY");
         console.log(finaldate);
     if(Doctor_ava_Date == finaldate){
          if(finaltime > dt && finaltime < d2){

             res.json({Status:"Success",Message:"Data List", Data : doctors ,Code:200}); 
          }
          else{
            if(dt>finaltime){
             res.json({Status:"Success",Message:"Data List", Data : doctors ,Code:200});
            }
           else{
             res.json({Status:"Failed",Message:"Doctor Not Available today Please select another Date",Data : [] ,Code:300});
           }
          }
      }
      else{
        res.json({Status:"Success",Message:"Data List", Data : doctors ,Code:200});
      }            
        }

        });
});

router.get('/getlist', function (req, res) {
        New_Doctor_time.find({}, function (err, Homebanners) {
            if (err) return res.status(500).send("There was a problem finding the Homebanners.");
            res.json({Status:"Success",Message:"Data Insert successfully", Data : Homebanners,Code:200});
        });
});


router.post('/doctor_ava_all', function (req, res) {
  var mysort = {Doctor_ava_Date: 1, Time: 1};
        New_Doctor_time.find({Doctor_email_id:req.body.Doctor_email_id}, function (err, Homebanners) {
            if (err) return res.status(500).send("There was a problem finding the Homebanners.");
                     res.json({Status:"Success",Message:"Data List successfully", Data : Homebanners,Code:200});
        }).sort(mysort);
});



router.post('/edit', async function (req, res) {
    let a1 = req.body.Time;
    var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
    var testime = (new Date(indiaTime)).toISOString();
    let timeslot = a1[0].Total_time_slot;
    let timeslotpart = timeslot.slice(0,8).toString();
    let timeslotpart2 = timeslot.slice(11,19).toString();
    var dt = moment(timeslotpart, ["h:mm A"]).format("HH:mm");
    var d2 = moment(timeslotpart2, ["h:mm A"]).format("HH:mm");
          let Doctor_ava_Date = req.body.Doctor_ava_Date;
          let totallist = Doctor_ava_Date + timeslot;
          let date = new Date();
         const time = moment(testime);
         var finaltime = moment(time).format("HH:mm");
         var finaldate = moment(new Date()).format("DD-MM-YYYY");
        if(Doctor_ava_Date == finaldate){
          if(finaltime > dt && finaltime < d2){
          await Doctor_time.findOne({Doctor_email_id:req.body.Doctor_email_id,Doctor_ava_Date:req.body.Doctor_ava_Date,Time:req.body.Time}, async function (err, Appointmentdetails) {
          console.log(Appointmentdetails);
          if(Appointmentdetails!== null){
            res.json({Status:"Failed",Message:"Slot not Available",Data : req.body ,Code:300});
          }
          else{
             await Doctor_time.findByIdAndUpdate(req.body._id, req.body, {new: true}, async function (err, user) {
            if (err) return res.status(500).send("There was a problem updating the user.");
            res.json({Status:"Success",Message:"Data updated successfully", Data : user,Code:200});
      });
          }
          
        });
          }
          else{
            if(dt>finaltime){
          await Doctor_time.findOne({Doctor_email_id:req.body.Doctor_email_id,Doctor_ava_Date:req.body.Doctor_ava_Date,Time:req.body.Time}, async function (err, Appointmentdetails) {
          console.log(Appointmentdetails);
          if(Appointmentdetails!== null){
            res.json({Status:"Failed",Message:"Slot not Available",Data : req.body ,Code:300});
          }
          else{
           await Doctor_time.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, user) {
            if (err) return res.status(500).send("There was a problem updating the user.");
            res.json({Status:"Success",Message:"Data updated successfully", Data : user,Code:200});
      });
          }
          
        });
            }
           else{
             res.json({Status:"Failed",Message:"Invalid time slot",Data: req.body ,Code:300});
           }
          }
      }
      else
      {
        await Doctor_time.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, user) {
            if (err) return res.status(500).send("There was a problem updating the user.");
            res.json({Status:"Success",Message:"Data updated successfully", Data : user,Code:200});
      
        });
      }
        });




// router.post('/update_doc_date', function (req, res) {
//   console.log(date_datas);
//     res.json({Status:"Success",Message:"Calendar Details Updated", Data : {} ,Code:200});

// });


router.post('/get_day_details',async function (req, res) {
   let Data =  date_datas.Days;
    res.json({Status:"Success",Message:"Calendar Details", Data : Data ,Code:200});
});









router.post('/delete/:id', function (req, res) {
      Doctor_time.findByIdAndRemove(req.params.id, function (err, user) {
          if (err) return res.status(500).send("There was a problem deleting details.");
          res.success(200, "Data Deleted Successfully");
      });
});




// // DELETES A USER FROM THE DATABASE
router.delete('/delete/:id', function (req, res) {
      Doctor_time.findByIdAndRemove(req.params.id, function (err, user) {
          if (err) return res.status(500).send("There was a problem deleting details.");
          res.success(200, "Data Deleted Successfully");
      });
});

module.exports = router;

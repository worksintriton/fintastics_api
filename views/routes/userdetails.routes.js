var express = require('express');
var router = express.Router();
const requestss = require("request");
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var userdetailsModel = require('./../models/userdetailsModel');
var locationdetailsModel = require('./../models/locationdetailsModel');
var dashboard_petlover = require('./dashboard_petlover.json');

router.post('/create', async function(req, res) {
  try{
       let random = Math.floor(Math.random() * 899999 + 100000);
       let phone  =  await userdetailsModel.findOne({user_phone : req.body.user_phone});
       console.log(phone);
       if(phone !== null){
        console.log('This phone number already registered');
        if(phone.user_status == 'Incomplete'){
           let a  = {
            user_details : phone
        }
        var json = "";
        var username = "tritonitsolutionstrans";
        var password = 20145;
        var mobilno = req.body.user_phone;
        var message =
          "Hi, Your OTP is " + phone.otp + ". Petfolio OTP for Signup.";
        // var dumbell = "DUMBELL";
        var dumbell = "VOXITW";
        var tye = 0;
        var baseurls =
          "http://www.smsintegra.com/" +
          "api/smsapi.aspx?uid=" +
          username +
          "&pwd=" +
          password +
          "&mobile=" +
          mobilno +
          "&msg=" +
          message +
          "&sid=" +
          dumbell +
          "&type=" +
          tye;
        console.log(baseurls);
        requestss(baseurls, { json: true }, async (err, response, body) => {
           if (err) {
            return console.log(err);
          }
          else{
        res.json({Status:"Success",Message:"Sign up successfully! welcome to petfolio",Data : a , Code:200}); 
              }
        });
        }else{
            res.json({Status:"Failed",Message:"This phone number already registered",Data : {},Code:404}); 
        }


       }else
       {
          await userdetailsModel.create({
            first_name:  req.body.first_name,
            last_name : req.body.last_name,
            user_email : req.body.user_email,
            user_phone : req.body.user_phone,
            date_of_reg : req.body.date_of_reg,
            user_type : req.body.user_type,
            user_status : "Incomplete",
            otp : random,
            fb_token : "",
            device_id : "",
            device_type : "",
        }, 
        function (err, user) {
          console.log(user)
        let a  = {
            user_details : user
        }
        var json = "";
        var username = "tritonitsolutionstrans";
        var password = 20145;
        var mobilno = req.body.user_phone;
        var message =
          "Hi, Your OTP is " + random + ". Petfolio OTP for Signup.";
        // var dumbell = "DUMBELL";
        var dumbell = "VOXITW";
        var tye = 0;
        var baseurls =
          "http://www.smsintegra.com/" +
          "api/smsapi.aspx?uid=" +
          username +
          "&pwd=" +
          password +
          "&mobile=" +
          mobilno +
          "&msg=" +
          message +
          "&sid=" +
          dumbell +
          "&type=" +
          tye;
        console.log(baseurls);
        requestss(baseurls, { json: true }, async (err, response, body) => {
           if (err) {
            return console.log(err);
          }
          else{
        res.json({Status:"Success",Message:"Sign up successfully! welcome to petfolio",Data : a , Code:200}); 
              }
        });
        });
       }
}
catch(e){
      res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
}
});


router.get('/deletes', function (req, res) {
      userdetailsModel.remove({}, function (err, user) {
          if (err) return res.status(500).send("There was a problem deleting the user.");
             res.json({Status:"Success",Message:"User Details Deleted", Data : {} ,Code:200});     
      });
});




router.post('/petlove/mobile/dashboard',async function (req, res) {
 let userdetails  =  await userdetailsModel.findOne({_id:req.body.user_id});
  let location_details  =  await locationdetailsModel.find({user_id:req.body.user_id,default_status:true});
 if(userdetails.user_type == 1){
    let a = {
    SOS : [],
    LocationDetails : location_details,
    PetDetails : [],
    userdetails : userdetails,
    Dashboarddata : dashboard_petlover
  }
  res.json({Status:"Success",Message:"Pet Lover Dashboard Details", Data : a ,Code:200});
}else{
  res.json({Status:"Failed",Message:"Working on it !", Data : {},Code:404});
}
});





router.post('/mobile/login',async function (req, res) {
    let userdetails  =  await userdetailsModel.findOne({user_phone:req.body.user_phone,user_status:"Incomplete"});
    if(userdetails == null){
      res.json({Status:"Failed",Message:"Invalid Account",Data : {},Code:404}); 
    } else 
    {
     console.log(userdetails);
     if(userdetails.user_type == 1){
     let random = Math.floor(Math.random() * 899999 + 100000);
     let updatedata = {otp:random}
     var updatedetails = await userdetailsModel.findByIdAndUpdate({_id:userdetails._id},updatedata,{
       new: true
     });
     console.log(updatedetails);
      let a  = {
            user_details : updatedetails
        }
        var json = "";
        var username = "tritonitsolutionstrans";
        var password = 20145;
        var mobilno = req.body.user_phone;
        var message =
          "Hi, Your OTP is " + random + ". Petfolio OTP for Signup.";
        // var dumbell = "DUMBELL";
        var dumbell = "VOXITW";
        var tye = 0;
        var baseurls =
          "http://www.smsintegra.com/" +
          "api/smsapi.aspx?uid=" +
          username +
          "&pwd=" +
          password +
          "&mobile=" +
          mobilno +
          "&msg=" +
          message +
          "&sid=" +
          dumbell +
          "&type=" +
          tye;
        console.log(baseurls);
        requestss(baseurls, { json: true }, async (err, response, body) => {
          if (err) {
            return console.log(err);
          }
          else{
             res.json({Status:"Success",Message:"OTP Send to your mobile number",Data : a , Code:200}); 
              }
         });
     }else if(userdetails.user_type == 4){
     let random = Math.floor(Math.random() * 899999 + 100000);
     let updatedata = {otp:random}
     var updatedetails = await userdetailsModel.findByIdAndUpdate({_id:userdetails._id},updatedata,{
       new: true
     });
     console.log(updatedetails);
      let a  = {
            user_details : updatedetails
        }
        var json = "";
        var username = "tritonitsolutionstrans";
        var password = 20145;
        var mobilno = req.body.user_phone;
        var message =
          "Hi, Your OTP is " + random + ". Petfolio OTP for Signup.";
        // var dumbell = "DUMBELL";
        var dumbell = "VOXITW";
        var tye = 0;
        var baseurls =
          "http://www.smsintegra.com/" +
          "api/smsapi.aspx?uid=" +
          username +
          "&pwd=" +
          password +
          "&mobile=" +
          mobilno +
          "&msg=" +
          message +
          "&sid=" +
          dumbell +
          "&type=" +
          tye;
        console.log(baseurls);
        requestss(baseurls, { json: true }, async (err, response, body) => {
          if (err) {
            return console.log(err);
          }
          else{
             res.json({Status:"Success",Message:"OTP Send to your mobile number",Data : a , Code:200}); 
              }
         });
     }
    }
});





router.post('/getlist_id', function (req, res) {
        userdetailsModel.find({Person_id:req.body.Person_id}, function (err, StateList) {
          res.json({Status:"Success",Message:"User Details List", Data : StateList ,Code:200});
        });
});


router.post('/mobile/resendotp', function (req, res) {
        userdetailsModel.findOne({user_phone:req.body.user_phone}, function (err, StateList) {
        if(StateList == null){
           res.json({Status:"Failed",Message:"Invalid Mobile Number", Data : {} ,Code:404});
        }else{
          let a = {
            User_Details : StateList
          }
        var json = "";
        var username = "tritonitsolutionstrans";
        var password = 20145;
        var mobilno = req.body.user_phone;
        var message =
          "Hi, Your OTP is " + StateList.otp + ". Petfolio OTP for signup resend.";
        // var dumbell = "DUMBELL";
        var dumbell = "VOXITW";
        var tye = 0;
        var baseurls =
          "http://www.smsintegra.com/" +
          "api/smsapi.aspx?uid=" +
          username +
          "&pwd=" +
          password +
          "&mobile=" +
          mobilno +
          "&msg=" +
          message +
          "&sid=" +
          dumbell +
          "&type=" +
          tye;
        console.log(baseurls);
        requestss(baseurls, { json: true }, async (err, response, body) => {
           if (err) {
            return console.log(err);
          }
          else{
          res.json({Status:"Success",Message:"OTP sent successfully! welcome to petfolio", Data : a ,Code:200});
              }
        });
        }
        });
});






router.get('/getlist', function (req, res) {
        userdetailsModel.find({}, function (err, Functiondetails) {
          res.json({Status:"Success",Message:"User Details Details", Data : Functiondetails ,Code:200});
        });
});


router.post('/mobile/update/fb_token', function (req, res) {
        userdetailsModel.findByIdAndUpdate(req.body.user_id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"FB Updated", Data : UpdatedDetails ,Code:200});
        });
});


router.post('/mobile/edit', function (req, res) {
        userdetailsModel.findByIdAndUpdate(req.body.user_id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"User Details Updated", Data : UpdatedDetails ,Code:200});
        });
});



router.post('/edit', function (req, res) {
        userdetailsModel.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"User Details Updated", Data : UpdatedDetails ,Code:200});
        });
});

// // DELETES A USER FROM THE DATABASE
router.post('/delete', function (req, res) {
      userdetailsModel.findByIdAndRemove(req.body._id, function (err, user) {
          if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
          res.json({Status:"Success",Message:"User Details Deleted successfully", Data : {} ,Code:200});
      });
});


module.exports = router;

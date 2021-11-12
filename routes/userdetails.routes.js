var express = require('express');
var router = express.Router();
const requestss = require("request");
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var GeoPoint = require('geopoint');

var userdetailsModel = require('./../models/userdetailsModel');



router.post('/create', async function(req, res) {
          var randomChars = '0123456789';
          var result = '';
          var roll_type = '';
          for ( var i = 0; i < 6; i++ ) {
           result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
          }
          if(req.body.parent_of !== ""){
            result = ''
          }
          if(req.body.account_type == "Family" && req.body.parent_of == ""){
            roll_type = 'Admin'
          }
          if(req.body.account_type == "Family" && req.body.parent_of !== ""){
            roll_type = 'Child'
          }
  try {
          await userdetailsModel.create({
              username:  req.body.username || "",
              password :req.body.password || "",
              user_email : req.body.user_email || "",
              first_name : req.body.first_name || "",
              last_name: req.body.last_name || "",
              dob: req.body.dob || "",
              contact_number : req.body.contact_number || "",
              fb_token : req.body.fb_token || "",
              mobile_type :req.body.mobile_type || "",
              delete_status :req.body.delete_status || "",
              account_type : req.body.account_type || "",
              roll_type : roll_type || "",
              parent_code :  result,
              parent_of: req.body.parent_of || "",
              profile_img : req.body.profile_img || "",
              delete_status : false
        }, 
        function (err, user) {
          console.log(err);
          res.json({Status:"Success",Message:"Sign up successfully! welcome to Fintastics",Data : user , Code:200}); 
        });
}
catch(e){
      res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
}
});



router.post('/check_parent_code',async function (req, res) {
      let phone  =  await userdetailsModel.findOne({parent_code : req.body.parent_code});
      if(phone == null){
          res.json({Status:"Failed",Message:"Parent Code not found", Data : {} ,Code:404});
      }else{
          res.json({Status:"Success",Message:"Valid Parent Code", Data : {} ,Code:200});
      } 
});


router.post('/year_list',async function (req, res) {
     console.log(req.body.current_year);
     var year_value = req.body.current_year;
     var year = []
     for(let a = 0 ; a < 50; a++){
          year.push(year_value - a);
          console.log(year_value);
          if(a == 50 - 1){
            res.json({Status:"Success",Message:"Yearly", Data : year,Code:200});
          }
     }
});


router.delete('/delete/:id', function (req, res) {
       console.log(req.params.id);
       userdetailsModel.findByIdAndRemove(req.params.id, function (err, user) {
          if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
          res.json({Status:"Success",Message:"Userdetail Deleted Successfully", Data : {} ,Code:200});
      });
});


router.put('/update/:id', function (req, res) {
        userdetailsModel.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
            console.log(err);
             res.json({Status:"Success",Message:"Userdetail Detail Updated", Data : UpdatedDetails ,Code:200});
        });
});



router.post('/send/emailotp',async function (req, res) {
  var randomChars = '0123456789';
          var result = '';
          for ( var i = 0; i < 6; i++ ) {
           result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
          }
   console.log(result);
    let random = result;
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: 'carpeinfinitus@gmail.com',
    pass: 'Petfolio!@#$%3'
  }
});

var mailOptions = {
  from: 'carpeinfinitus@gmail.com',
  to: req.body.user_email,
  subject: "Email verification OTP",
  text: "Hi, Your OTP is " + random + ". Petfolio OTP for Signup."
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    res.json({Status:"Success",Message:"Eamil id sent successfully",Data : {
      'email_id': req.body.user_email,
      'otp' : random
    } , Code:200}); 
  }
});
});



router.post('/forgotpassword',async function (req, res) {
   let phone  =  await userdetailsModel.findOne({user_email : req.body.user_email});
   if(phone == null){
      res.json({Status:"Failed",Message:"Invalid Eamil id",Data : {} , Code:404}); 
   }else{
    result = phone.password;
  console.log(result);
    let random = result;
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: 'carpeinfinitus@gmail.com',
    pass: 'Petfolio!@#$%3'
  }
});

var mailOptions = {
  from: 'carpeinfinitus@gmail.com',
  to: req.body.user_email,
  subject: "Forgot password",
  text: "Hi, This is your password " + random + "."
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    res.json({Status:"Success",Message:"Eamil id sent successfully",Data : {} , Code:200}); 
  }
});
}







});



router.get('/deletes', function (req, res) {
      userdetailsModel.remove({}, function (err, user) {
          if (err) return res.status(500).send("There was a problem deleting the user.");
             res.json({Status:"Success",Message:"User Details Deleted", Data : {} ,Code:200});     
      });
});


router.post('/filter_date', function (req, res) {
        userdetailsModel.find({}, function (err, StateList) {
          var final_Date = [];
          for(let a = 0; a < StateList.length; a ++){
            var fromdate = new Date(req.body.fromdate);
            var todate = new Date(req.body.todate);
            var checkdate = new Date(StateList[a].createdAt);
          
            if(checkdate >= fromdate && checkdate <= todate){
              final_Date.push(StateList[a]);
            }
            if(a == StateList.length - 1){
              res.json({Status:"Success",Message:"Demo screen  List", Data : final_Date ,Code:200});
            }
          }
        });
});













router.post('/mobile/login',async function (req, res) {
    let userdetails  =  await userdetailsModel.findOne({"user_email":req.body.user_email,"password":req.body.password});
    console.log(userdetails);
    if(userdetails == null){
       res.json({Status:"Failed",Message:"Unable to Sign In, User account not found", Data : {} ,Code:404});
    }else{
        res.json({Status:"Success",Message:"Logged in successfully", Data : userdetails ,Code:200});
    } 
});



router.post('/getlist_id', function (req, res) {
        userdetailsModel.find({Person_id:req.body.Person_id}, function (err, StateList) {
          res.json({Status:"Success",Message:"User Details List", Data : StateList ,Code:200});
        });
});



router.post('/fetch_child', function (req, res) {
        userdetailsModel.find({parent_of:req.body.parent_of}, function (err, StateList) {
          res.json({Status:"Success",Message:"Child Detail List", Data : StateList ,Code:200});
        });
});









router.get('/getlist', function (req, res) {
        userdetailsModel.find({}, function (err, Functiondetails) {
          res.json({Status:"Success",Message:"User Details Details", Data : Functiondetails ,Code:200});
        });
});




router.post('/mobile/update/fb_token', function (req, res) {
  console.log(req.body);
        userdetailsModel.findByIdAndUpdate(req.body.user_id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
            console.log(err);
             res.json({Status:"Success",Message:"FB Updated", Data : UpdatedDetails ,Code:200});
             console.log(req.body);
        });
});




router.post('/block_unblock_user', function (req, res) {
  console.log(req.body);
        userdetailsModel.findByIdAndUpdate(req.body.user_id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
            console.log(err);
             res.json({Status:"Success",Message:"Status Updated", Data : UpdatedDetails ,Code:200});
             console.log(req.body);
        });
});




router.post('/mobile/update/profile', function (req, res) {
        userdetailsModel.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"Profile Updated", Data : UpdatedDetails ,Code:200});
        });
});




router.post('/update_token', function (req, res) {
        userdetailsModel.find({},async function (err, StateList) {
          for(let a  = 0 ; a  < StateList.length; a++)
          {
         userdetailsModel.findByIdAndUpdate(StateList[a]._id,{fb_token : ""}, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             // res.json({Status:"Success",Message:"FB Updated", Data : UpdatedDetails ,Code:200});
          });
          if(a == StateList.length - 1){
          res.json({Status:"Success",Message:"User Details List", Data : StateList ,Code:200});
          }
          }
        });
});



// // DELETES A USER FROM THE DATABASE
router.post('/delete_by_phone',async function (req, res) {
      let phone  =  await userdetailsModel.findOne({user_phone : req.body.user_phone});
      if(phone == null){
          res.json({Status:"Failed",Message:"Already User Details Deleted successfully", Data : {} ,Code:200});
      }else{
         userdetailsModel.findByIdAndRemove(phone._id, function (err, user) {
          if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
          res.json({Status:"Success",Message:phone.user_phone + " User Details Deleted successfully", Data : {} ,Code:200});
      });
      }
     
});


router.post('/logout',async function (req, res) {
          userdetailsModel.findByIdAndUpdate(req.body.user_id,{fb_token : ""}, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"FB Remove", Data : {} ,Code:200});
          });
});




// // DELETES A USER FROM THE DATABASE
router.post('/admin_delete', function (req, res) {
      userdetailsModel.findByIdAndRemove(req.body._id, function (err, user) {
          if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
          res.json({Status:"Success",Message:"User Details Deleted successfully", Data : {} ,Code:200});
      });
});


module.exports = router;

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var locationdetailsModel = require('./../models/locationdetailsModel');


router.post('/create', async function(req, res) {
   
   let default_Status = true
   let location_details  =  await locationdetailsModel.findOne({user_id:req.body.user_id});
   if(location_details == null){
        default_Status = true
   } else {
        default_Status = false
   }
  try{
        await locationdetailsModel.create({
            user_id:  req.body.user_id,
            location_state : req.body.location_state,
            location_country : req.body.location_country,
            location_city : req.body.location_city,
            location_pin : req.body.location_pin,
            location_address : req.body.location_address,
            location_lat : req.body.location_lat,
            location_long : req.body.location_long,
            location_title : req.body.location_title,
            location_nickname : req.body.location_nickname,
            default_status : default_Status,
            date_and_time : req.body.date_and_time,
        }, 
        function (err, user) {
          console.log(user)
        res.json({Status:"Success",Message:"Location Added successfully", Data : user ,Code:200}); 
        });
}
catch(e){
      res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
}
});


router.get('/deletes', function (req, res) {
      locationdetailsModel.remove({}, function (err, user) {
          if (err) return res.status(500).send("There was a problem deleting the user.");
             res.json({Status:"Success",Message:"Location Deleted", Data : {} ,Code:200});     
      });
});


router.post('/mobile/getlist_id', function (req, res) {
        locationdetailsModel.find({user_id:req.body.user_id}, function (err, StateList) {
          res.json({Status:"Success",Message:"Location List", Data : StateList ,Code:200});
        });
});



router.get('/getlist', function (req, res) {
        locationdetailsModel.find({}, function (err, Functiondetails) {
          res.json({Status:"Success",Message:"Location Details", Data : Functiondetails ,Code:200});
        });
});


router.get('/mobile/getlist', function (req, res) {
        locationdetailsModel.find({}, function (err, Functiondetails) {
          let a = {
            usertypedata : Functiondetails
          }
          res.json({Status:"Success",Message:"Location Details", Data : a ,Code:200});
        });
});

router.post('/edit', function (req, res) {
        locationdetailsModel.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"Location Updated", Data : UpdatedDetails ,Code:200});
        });
});
// // DELETES A USER FROM THE DATABASE
router.post('/delete', function (req, res) {
      locationdetailsModel.findByIdAndRemove(req.body._id, function (err, user) {
          if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
          res.json({Status:"Success",Message:"Location Deleted successfully", Data : {} ,Code:200});
      });
});


module.exports = router;

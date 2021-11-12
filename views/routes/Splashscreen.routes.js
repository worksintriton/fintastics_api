var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var SplashscreenModel = require('./../models/SplashscreenModel');


router.post('/create', async function(req, res) {
  try{

        await SplashscreenModel.create({
            img_path:  req.body.img_path,
            img_title : req.body.img_title,
            img_index : req.body.img_index,
            show_status : req.body.show_status,
            date_and_time : req.body.date_and_time,
        }, 
        function (err, user) {
          console.log(user)
        res.json({Status:"Success",Message:"Splash screen Added successfully", Data : user ,Code:200}); 
        });
}
catch(e){
      res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
}
});


router.get('/deletes', function (req, res) {
      SplashscreenModel.remove({}, function (err, user) {
          if (err) return res.status(500).send("There was a problem deleting the user.");
             res.json({Status:"Success",Message:"Splash screen  Deleted", Data : {} ,Code:200});     
      });
});


router.post('/getlist_id', function (req, res) {
        SplashscreenModel.find({Person_id:req.body.Person_id}, function (err, StateList) {
          res.json({Status:"Success",Message:"Splash screen  List", Data : StateList ,Code:200});
        });
});



router.get('/getlist', function (req, res) {
        SplashscreenModel.find({}, function (err, Functiondetails) {
          res.json({Status:"Success",Message:"Splash screen  Details", Data : Functiondetails ,Code:200});
        });
});


router.get('/mobile/getlist', function (req, res) {
        SplashscreenModel.find({show_status:true}, function (err, Functiondetails) {
          let a ={
             SplashScreendata : Functiondetails
          }
          res.json({Status:"Success",Message:"Splash screen  Details", Data : a ,Code:200});
        });
});


router.post('/edit', function (req, res) {
        SplashscreenModel.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"Splash screen  Updated", Data : UpdatedDetails ,Code:200});
        });
});
// // DELETES A USER FROM THE DATABASE
router.post('/delete', function (req, res) {
      SplashscreenModel.findByIdAndRemove(req.body._id, function (err, user) {
          if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
          res.json({Status:"Success",Message:"Splash screen Deleted successfully", Data : {} ,Code:200});
      });
});
module.exports = router;

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var notificationModel = require('./../models/notificationModel');


router.post('/create', async function(req, res) {
  try{
        await notificationModel.create({
            user_id:  req.body.user_id,
            notify_title : req.body.notify_title,
            notify_descri : req.body.notify_descri,
            notify_img : req.body.notify_img,
            notify_time : "",
            date_and_time : req.body.date_and_time
        }, 
        function (err, user) {
          console.log(user)
        res.json({Status:"Success",Message:"Notification Added successfully", Data : user ,Code:200}); 
        });
}
catch(e){
      res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
}
});


router.get('/deletes', function (req, res) {
      notificationModel.remove({}, function (err, user) {
          if (err) return res.status(500).send("There was a problem deleting the user.");
             res.json({Status:"Success",Message:"Notification Deleted", Data : {} ,Code:200});     
      });
});


router.post('/mobile/getlist_id', function (req, res) {
        notificationModel.find({user_id:req.body.user_id}, function (err, StateList) {
          res.json({Status:"Success",Message:"Notification List", Data : StateList ,Code:200});
        });
});



router.get('/getlist', function (req, res) {
        notificationModel.find({}, function (err, Functiondetails) {
          res.json({Status:"Success",Message:"Notification Details", Data : Functiondetails ,Code:200});
        });
});


router.get('/mobile/getlist', function (req, res) {
        notificationModel.find({}, function (err, Functiondetails) {
          let a = {
            usertypedata : Functiondetails
          }
          res.json({Status:"Success",Message:"Notification Details", Data : a ,Code:200});
        });
});

router.post('/edit', function (req, res) {
        notificationModel.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"Notification Updated", Data : UpdatedDetails ,Code:200});
        });
});

// // DELETES A USER FROM THE DATABASE
router.post('/delete', function (req, res) {
      notificationModel.findByIdAndRemove(req.body._id, function (err, user) {
          if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
          res.json({Status:"Success",Message:"Notification Deleted successfully", Data : {} ,Code:200});
      });
});

module.exports = router;

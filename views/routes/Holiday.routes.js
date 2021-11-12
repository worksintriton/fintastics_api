var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var HolidayModel = require('./../models/HolidayModel');


router.post('/create', async function(req, res) {
  try{
    var datas = await HolidayModel.findOne({user_id:req.body.user_id,Date:req.body.Date});
    if(datas == null){
              await HolidayModel.create({
            user_id:  req.body.user_id,
            Date : req.body.Date
        }, 
        function (err, user) {
          console.log(user)
        res.json({Status:"Success",Message:"Added successfully", Data : user ,Code:200}); 
        });
            }else{
              res.json({Status:"Failed",Message:"Already added", Data : {} ,Code:404}); 
            }
}
catch(e){
      res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
}
});


router.get('/deletes', function (req, res) {
      HolidayModel.remove({}, function (err, user) {
          if (err) return res.status(500).send("There was a problem deleting the user.");
             res.json({Status:"Success",Message:"ActivityModel Deleted", Data : {} ,Code:200});     
      });
});


router.post('/getlist_id', function (req, res) {
        HolidayModel.find({user_id:req.body.user_id}, function (err, StateList) {
          res.json({Status:"Success",Message:"doctor holiday list", Data : StateList ,Code:200});
        });
});



router.get('/getlist', function (req, res) {
        HolidayModel.find({}, function (err, Functiondetails) {
          res.json({Status:"Success",Message:"doctor holiday list", Data : Functiondetails ,Code:200});
        });
});


router.post('/edit', function (req, res) {
        HolidayModel.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"Functiondetails Updated", Data : UpdatedDetails ,Code:200});
        });
});
// // DELETES A USER FROM THE DATABASE
router.post('/delete', function (req, res) {
      HolidayModel.findByIdAndRemove(req.body._id, function (err, user) {
          if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
          res.json({Status:"Success",Message:"Holiday Deleted successfully", Data : {} ,Code:200});
      });
});
module.exports = router;

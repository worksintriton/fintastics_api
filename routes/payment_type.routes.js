var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var payment_typeModel = require('./../models/payment_typeModel');
var desc_typeModel = require('./../models/desc_typeModel');

router.post('/create', async function(req, res) {
  try{
        await payment_typeModel.create({
            payment_type : req.body.payment_type,
            date_and_time: req.body.date_and_time,
            delete_status : false
        }, 
        function (err, user) {
          console.log(user)
        res.json({Status:"Success",Message:"Added successfully", Data : user ,Code:200}); 
        });
}
catch(e){
      res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
}
});


router.get('/deletes', function (req, res) {
      payment_typeModel.remove({}, function (err, user) {
          if (err) return res.status(500).send("There was a problem deleting the user.");
             res.json({Status:"Success",Message:"payment type Deleted", Data : {} ,Code:200});     
      });
});


router.post('/getlist_id', function (req, res) {
        payment_typeModel.find({Person_id:req.body.Person_id}, function (err, StateList) {
          res.json({Status:"Success",Message:"payment type List", Data : StateList ,Code:200});
        });
});



router.get('/getlist',async function (req, res) {
       let desc_type  =  await desc_typeModel.find({});
        payment_typeModel.find({}, function (err, Functiondetails) {
          res.json({Status:"Success",Message:"payment type Details", Data : Functiondetails ,desc_type : desc_type,Code:200});
        });
});


router.post('/edit', function (req, res) {
        payment_typeModel.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"payment type Updated", Data : UpdatedDetails ,Code:200});
        });
});
// // DELETES A USER FROM THE DATABASE
router.post('/delete', function (req, res) {
      payment_typeModel.findByIdAndRemove(req.body._id, function (err, user) {
          if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
          res.json({Status:"Success",Message:"payment type Deleted successfully", Data : {} ,Code:200});
      });
});
module.exports = router;

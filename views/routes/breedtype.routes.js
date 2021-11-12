var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var breedtypeModel = require('./../models/breedtypeModel');


router.post('/create', async function(req, res) {
  try{

        await breedtypeModel.create({
            pet_type_id: req.body.pet_type_id,
            pet_breed : req.body.pet_breed,
            user_type_value : req.body.user_type_value,
            date_and_time : req.body.date_and_time
        }, 
        function (err, user) {
          console.log(user)
        res.json({Status:"Success",Message:"breed type Added successfully", Data : user ,Code:200}); 
        });
}
catch(e){
      res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
}
});


router.get('/deletes', function (req, res) {
      breedtypeModel.remove({}, function (err, user) {
          if (err) return res.status(500).send("There was a problem deleting the user.");
             res.json({Status:"Success",Message:"breed type Deleted", Data : {} ,Code:200});     
      });
});


router.post('/mobile/getlist_id', function (req, res) {
        breedtypeModel.find({pet_type_id:req.body.pet_type_id}, function (err, StateList) {
          res.json({Status:"Success",Message:"breed type List", Data : StateList ,Code:200});
        });
});



router.get('/getlist', function (req, res) {
        breedtypeModel.find({}, function (err, Functiondetails) {
          res.json({Status:"Success",Message:"breed type Details", Data : Functiondetails ,Code:200});
        });
});


router.get('/mobile/getlist', function (req, res) {
        breedtypeModel.find({}, function (err, Functiondetails) {
          let a = {
            usertypedata : Functiondetails
          }
          res.json({Status:"Success",Message:"breed type Details", Data : a ,Code:200});
        });
});

router.post('/edit', function (req, res) {
        breedtypeModel.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"breed type Updated", Data : UpdatedDetails ,Code:200});
        });
});

// // DELETES A USER FROM THE DATABASE
router.post('/delete', function (req, res) {
      breedtypeModel.findByIdAndRemove(req.body._id, function (err, user) {
          if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
          res.json({Status:"Success",Message:"breed type Deleted successfully", Data : {} ,Code:200});
      });
});


module.exports = router;

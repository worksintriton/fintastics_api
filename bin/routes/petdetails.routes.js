var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
// petdetailsModel.js

var petdetailsModel = require('./../models/petdetailsModel');


router.post('/mobile/create', async function(req, res) {
  try{
        await petdetailsModel.create({
            user_id:  req.body.user_id,
            pet_img : req.body.pet_img,
            pet_name : req.body.pet_name,
            pet_type : req.body.pet_type,
            pet_breed : req.body.pet_breed,
            pet_gender : req.body.pet_gender,
            pet_color : req.body.pet_color,
            pet_weight : req.body.pet_weight,
            pet_age : req.body.pet_age,
            vaccinated : req.body.vaccinated,
            last_vaccination_date : req.body.last_vaccination_date,
            default_status : req.body.default_status,
            date_and_time : req.body.date_and_time,
        }, 
        function (err, user) {
          console.log(user)
            console.log(err)
        res.json({Status:"Success",Message:"pet details Added successfully", Data : user ,Code:200}); 
        });
}
catch(e){
      res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
}
});


router.get('/deletes', function (req, res) {
      petdetailsModel.remove({}, function (err, user) {
          if (err) return res.status(500).send("There was a problem deleting the user.");
             res.json({Status:"Success",Message:"pet details Deleted", Data : {} ,Code:200});     
      });
});



router.get('/mobile/dropdownslist', function (req, res) {
  let a = [
    {pet_type : "Dod"},
    {pet_type : "Cat"},
    {pet_type : "Dod 2"},
    {pet_type : "Dod 3"},
    {pet_type : "Dod 4"},
    {pet_type : "Dod 5"},
    {pet_type : "Dod 6"}
  ];
  let b = [
     {pet_breed : "breed 1"},
     {pet_breed : "breed 2"},
     {pet_breed : "breed 3"},
     {pet_breed : "breed 4"},
     {pet_breed : "breed 5"},
     {pet_breed : "breed 6"}
  ];
  let c = [
     {gender : "Male"},
     {gender : "Female"},
     {gender : "Others"},
  ];
   let d = [
     {color : "red"},
     {color : "white"},
     {color : "green"},
     {color : "yellow"},
  ];
  let e = [
     {specialzation : "specialzation - 1"},
     {specialzation : "specialzation - 2"},
     {specialzation : "specialzation - 3"},
  ];
  let f = [
     {pet_handle : "pet_handle - 1"},
     {pet_handle : "pet_handle - 2"},
     {pet_handle : "pet_handle - 3"},
  ];
   let g = [
     {services : "services - 1"},
     {services : "services - 2"},
     {services : "services - 3"},
  ];
  final = {
    Pet_type : a ,
    Pet_breed : b,
    Gender : c,
    color : d,
    specialzation : e,
    pet_handle : f,
    services : g
  }
 res.json({Status:"Success",Message:"Pet type list", Data : final ,Code:200});
});



router.get('/deletes', function (req, res) {
      petdetailsModel.remove({}, function (err, user) {
          if (err) return res.status(500).send("There was a problem deleting the user.");
             res.json({Status:"Success",Message:"pet details Deleted", Data : {} ,Code:200});     
      });
});




router.post('/mobile/getlist_id', function (req, res) {
        petdetailsModel.find({user_id:req.body.user_id}, function (err, StateList) {
          res.json({Status:"Success",Message:"pet details List", Data : StateList ,Code:200});
        });
});



router.get('/getlist', function (req, res) {
        petdetailsModel.find({}, function (err, Functiondetails) {
          res.json({Status:"Success",Message:"pet details Details", Data : Functiondetails ,Code:200});
        });
});


router.get('/mobile/getlist', function (req, res) {
        petdetailsModel.find({}, function (err, Functiondetails) {
          let a = {
            usertypedata : Functiondetails
          }
          res.json({Status:"Success",Message:"pet details Details", Data : a ,Code:200});
        });
});

router.post('/edit', function (req, res) {
        petdetailsModel.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"pet details Updated", Data : UpdatedDetails ,Code:200});
        });
});
// // DELETES A USER FROM THE DATABASE
router.post('/delete', function (req, res) {
      petdetailsModel.findByIdAndRemove(req.body._id, function (err, user) {
          if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
          res.json({Status:"Success",Message:"pet details Deleted successfully", Data : {} ,Code:200});
      });
});


module.exports = router;

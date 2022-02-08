var express = require('express');
var router = express.Router();
var transactionModel = require('./../models/transactionModel');
var userdetailsModel = require('./../models/userdetailsModel');
router.get('/getList', async function(req, res) {
    try{
     var data = {};
     var userdetailsTotalCount = await userdetailsModel.find().countDocuments();
     var familyAcType = await userdetailsModel.find({"account_type" : "Family","roll_type":"Admin"}).countDocuments();
     var personalAcType = await userdetailsModel.find({"account_type" : "Personal"}).countDocuments();
     var transactionTotalCount = await transactionModel.find().countDocuments();

   
     data.userdetailsTotalCount = userdetailsTotalCount;
     data.familyAcType = familyAcType;
     data.personalAcType = personalAcType;
     data.transactionTotalCount = transactionTotalCount;
  

     res.json({Status:"Success",Message:"Get Dasboard details", Data : data ,Code:200}); 
  }
  catch(e){
        res.json({Status:"Failed",Message:"Internal Server Error", data : {},Code:500});
  }
  });

  module.exports = router;
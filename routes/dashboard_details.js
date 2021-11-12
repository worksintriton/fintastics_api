var express = require('express');
var router = express.Router();

var userdetailsModel = require('./../models/userdetailsModel');
router.get('/getList', async function(req, res) {
    try{
     var data = {};
     var fault_count = await fault_typeModel.countDocuments();
     var ticketLiftsCount =  await ticketModel.find({"type" : "1"}).countDocuments();
     var ticketElsCount = await ticketModel.find({"type" : "2"}).countDocuments();
     var cmrlCount = await userdetailsModel.find({"user_type" : 1}).countDocuments();
     var jonsonCount = await userdetailsModel.find({"user_type" : 2}).countDocuments();

     var left_Completed = await ticketModel.find({"type":1,"status" :"Completed"}).countDocuments();
     var left_InCompleted = await ticketModel.find({"type":1,"status" :"Incomplete"}).countDocuments();
     var left_Close = await ticketModel.find({"type":1,"status" :"Close"}).countDocuments();
     var left_Open = await ticketModel.find({"type":1,"status" :"Open"}).countDocuments();

     var ESCALATORS_Completed = await ticketModel.find({"type":2,"status" :"Complete"}).countDocuments();
     var ESCALATORS_InCompleted = await ticketModel.find({"type":2,"status" :"Incomplete"}).countDocuments();
     var ESCALATORS_Close = await ticketModel.find({"type":2,"status" :"Close"}).countDocuments();
     var ESCALATORS_Open = await ticketModel.find({"type":2,"status" :"Open"}).countDocuments();

     var today = new Date();
     var dd = String(today.getDate()).padStart(2, '0');
     var mm = String(today.getMonth() + 1).padStart(2, '0'); 
     var yyyy = today.getFullYear();
     today = dd + '-' + mm + '-' + yyyy;
     console.log("today",today);
     var numUserLogin = await attendanceModel.find({"date" : today}).countDocuments();
     var numUserLogOut = await attendanceModel.find({"date" : today,"check_out_time": today}).countDocuments();
    
     data.jonsonCount = jonsonCount;
     data.cmrlCount = cmrlCount;
     data.fault_count = fault_count;
     data.ticketLiftsCount = ticketLiftsCount;
     data.ticketElsCount = ticketElsCount;
     data.numUserLogin = numUserLogin;
     data.numUserLogOut =numUserLogOut;



     data.left_Completed = left_Completed;
     data.left_InCompleted = left_InCompleted;
     data.left_Close = left_Close;
     data.left_Open = left_Open;

     data.ESCALATORS_Completed = ESCALATORS_Completed;
     data.ESCALATORS_InCompleted = ESCALATORS_InCompleted;
     data.ESCALATORS_Close = ESCALATORS_Close;
     data.ESCALATORS_Open = ESCALATORS_Open;
     res.json({Status:"Success",Message:"Get Dasboard details", Data : data ,Code:200}); 
  }
  catch(e){
        res.json({Status:"Failed",Message:"Internal Server Error", data : {},Code:500});
  }
  });

  module.exports = router;
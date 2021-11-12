var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var transactionModel = require('./../models/transactionModel');
var userdetailsModel = require('./../models/userdetailsModel');


router.post('/create', async function(req, res) {
  var system_date = req.body.transaction_date.split(" ");
  var system_date1 = system_date[0].split("-");
  var final_time = system_date1[2]+"-"+system_date1[1]+"-"+ system_date1[0];
   system_date = final_time+"T00:00:00.000Z";
  try{
        await transactionModel.create({
          transaction_date :  req.body.transaction_date,
          transaction_type : req.body.transaction_type,
          transaction_desc : req.body.transaction_desc,
          transaction_way : req.body.transaction_way,
          transaction_amount : req.body.transaction_amount,
          transaction_balance : req.body.transaction_balance,
          system_date : system_date,
          user_id : req.body.user_id,
          parent_code : req.body.parent_code,
          delete_status : false
        }, 
        function (err, user) {
          console.log(user)
          console.log(err);
        res.json({Status:"Success",Message:"Added successfully", Data : user ,Code:200}); 
        });
}
catch(e){
      res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
}
});


router.get('/deletes', function (req, res) {
      transactionModel.remove({}, function (err, user) {
          if (err) return res.status(500).send("There was a problem deleting the user.");
             res.json({Status:"Success",Message:"transaction Deleted", Data : {} ,Code:200});     
      });
});



router.post('/budget_getlist_id', function (req, res) {
    var total_value = 0;
    var expend_value = 0;
    var income_data = [];
    for(let c = 0 ; c < 12;c++){
     let dc = {
      spend_amount : 0,
      income_amount : 0,
      available_amount : 0
     }
     income_data.push(dc);
    }
    console.log(income_data);
    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way:"Credit"}
    },
    {   
        $group: {
            _id: "$transaction_way",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,translist) {
      if (err) {
        res.send(err);
      } else {
        translist.forEach(element => {
          total_value = total_value + element.price;
       });
      }
      console.log(total_value);
      call2();
   //    console.log(translist);
   // let datas = {
   //  expensive_data : translist,
   //  income_data : [],
   //  total_income : total_value
   // }
   // res.json({Status:"Success",Message:"transaction List", Data : datas ,Code:200});
    }
  );



    function call2(){
    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way:"Credit"}
    },
    {   
        $group: {
            _id: {$substr: ['$system_date', 5, 2]}, 
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,translist) {
      if (err) {
        res.send(err);
      } else {
        translist.forEach(element => {
        console.log(element);
        let index = +element._id - 1;
        console.log('index',index);
        income_data[index].income_amount = element.price;
        income_data[index].available_amount = element.price;
       });

      console.log(income_data);
      call3();
      }
    }
  );
    }



    function call3(){
    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way:"Debit"}
    },
    {   
        $group: {
            _id: {$substr: ['$system_date', 5, 2]}, 
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,translist) {
      if (err) {
        res.send(err);
      } else {
        translist.forEach(element => {
        console.log(element);
        let index = +element._id - 1;
        console.log('index',index);
        income_data[index].spend_amount = element.price;
        income_data[index].available_amount = income_data[index].available_amount - element.price;
       });

      console.log(income_data);
      call4();
      }
    }
  );
    }


  function call4(){
    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way:"Debit"}
    },
    {   
        $group: {
             _id: "$transaction_type",
            price: {$sum: "$transaction_amount"},
            percentage : {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,translist) {
      if (err) {
        res.send(err);
      } else {
        translist.forEach(element => {
         var count = (100 * element.price) / total_value;
          element.percentage = count;
          expend_value = expend_value + element.price;
       });
      }
      console.log(translist);
   let datas = {
    expensive_data : translist,
    income_data : income_data,
    expend_value : expend_value,
    total_income : total_value
   }
   res.json({Status:"Success",Message:"transaction List", Data : datas ,Code:200});
    }
  );
  }








   // let data = {
   //     "Income_amount" : 20000,
   //     "Income_data":[
   //        {
   //            "spend" : 200,
   //            "income": 150,
   //            "balance" : 2000
   //        },  
   //        {
   //            "spend" : 200,
   //            "income": 150,
   //            "balance" : 2000
   //        },  
   //        {
   //            "spend" : 200,
   //            "income": 150,
   //            "balance" : 2000
   //        },  
   //        {
   //            "spend" : 200,
   //            "income": 150,
   //            "balance" : 2000
   //        },
   //         {
   //            "spend" : 200,
   //            "income": 150,
   //            "balance" : 2000
   //        },
   //         {
   //            "spend" : 200,
   //            "income": 150,
   //            "balance" : 2000
   //        },
   //         {
   //            "spend" : 200,
   //            "income": 150,
   //            "balance" : 2000
   //        },
   //         {
   //            "spend" : 200,
   //            "income": 150,
   //            "balance" : 2000
   //        },
   //         {
   //            "spend" : 200,
   //            "income": 150,
   //            "balance" : 2000
   //        },
   //        {
   //            "spend" : 200,
   //            "income": 150,
   //            "balance" : 2000
   //        }, 
   //        {
   //            "spend" : 200,
   //            "income": 150,
   //            "balance" : 2000
   //        },
   //        {
   //            "spend" : 200,
   //            "income": 150,
   //            "balance" : 2000
   //        }
   //     ]
   //    }
 // res.json({Status:"Success",Message:"transaction List", Data : data ,Code:200});
        // transactionModel.find({user_id:req.body.user_id}, function (err, StateList) {
        // });
});


router.post('/getlist_id', function (req, res) {
        transactionModel.find({Person_id:req.body.Person_id}, function (err, StateList) {
          res.json({Status:"Success",Message:"transaction List", Data : StateList ,Code:200});
        });
});



router.post('/get_balance_amount',async function (req, res) {
   let Balance_amount = 0;
   let Credit_amount  =  await transactionModel.find({user_id:req.body.user_id,"transaction_way": "Credit"});
   let Debit_amount  =  await transactionModel.find({user_id:req.body.user_id,"transaction_way": "Debit"});
   let fin_credit = 0;
   let fin_debit = 0;
   Credit_amount.forEach(element => {
    fin_credit = +fin_credit + +element.transaction_amount;
   });
   Debit_amount.forEach(element => {
    fin_debit = +fin_debit + +element.transaction_amount;
   });
   console.log(fin_credit,fin_debit);
   Balance_amount = fin_credit - fin_debit;
   let data = {
    Credit_amount : fin_credit,
    Debit_amount : fin_debit,
    Balance_amount : Balance_amount
   }
   res.json({Status:"Success",Message:"Total Available Balance", Data:data ,Code:200});

// transactionModel.aggregate(
//    [
//      {
//        $group:
//          {
//            _id: {user_id: "$user_id",transaction_way: "Debit"},
//            totalAmount: { $sum: "$transaction_amount" },
//            count: { $sum: 1 }
//          }
//      }
//     ],
//       function (err, data) {
//         // console.log(err);
//         if (err) {
//           // return commonUtil.makeErrorResponse(res, err, "", "");
//         } else {
//           // console.log(data);
//           res.json({Status:"Success",Message:"Ticket get Filter Datas List", Data : data ,Code:200});
//         }
//       }
// )



   // let Balance = Credit_amount - Debit_amount
   // res.json({Status:"Success",Message:"transaction List", Data : StateList ,Code:200});
   //      transactionModel.find({user_id:req.body.user_id,"transaction_way": "Credit"}, function (err, StateList) {
          
   //      });
});





// router.post('/movement/report',async function (req, res) {
//    var total_credit_value = 0;
//    var total_debit_value = 0;
//    if(req.body.start_date == '' && req.body.end_date == ''){
//     var final_data = [];
//     transactionModel.aggregate([
//     {$match: {user_id: req.body.user_id,transaction_type:req.body.transaction_type}
//     },
//     {   
//         $group: {
//             _id: {$substr: ['$system_date', 0, 7]}, 
//             price: {$sum: "$transaction_amount"}
//         }
//     }
//     ],
//     function(err,translist) {
//       if (err) {
//         res.send(err);
//       } else {
//         translist.forEach(element => {
//        var splitted = element._id.split("T");
//        element.date = splitted[0];
//        element.credeit_amount = 0;
//        element.debit_amount = 0;
//        });
//         final_data = translist
//       }
//     }
//   );

//   transactionModel.aggregate([
//     {$match: {user_id: req.body.user_id,transaction_way: "Debit",transaction_type:req.body.transaction_type}
//     },
//     {   
//         $group: {
//            _id: {$substr: ['$system_date', 0, 7]}, 
//             price: {$sum: "$transaction_amount"}
//         }
//     }
//     ],
//     function(err,result) {
//       if (err) {
//         res.send(err);
//       } else {
//         console.log(result);
//        for(let a = 0; a < final_data.length; a++){
//        result.forEach(element => {
//        if(element._id == final_data[a]._id)
//        final_data[a].debit_amount = element.price;
//        total_credit_value = total_credit_value + element.price;
//        });
//        }

//     transactionModel.aggregate([
//     {$match: {user_id: req.body.user_id,transaction_way: "Credit",transaction_type:req.body.transaction_type}
//     },
//     {   
//         $group: {
//            _id: {$substr: ['$system_date', 0, 7]}, 
//             price: {$sum: "$transaction_amount"}
//         }
//     }
//     ],
//     function(err,result1) {
//       if (err) {
//         res.send(err);
//       } else {
//         console.log(result1);
//        for(let a = 0; a < final_data.length; a++){
//        result1.forEach(element => {
//        if(element._id == final_data[a]._id)
//        final_data[a].credeit_amount = element.price;
//        total_credit_value = total_debit_value + element.price;
//        });
//        }
//        let values = {
//       total_credit_value : total_credit_value,
//       total_debit_value : total_debit_value,
//       available_balance : total_credit_value - total_debit_value
//       } 
//       res.json({Status:"Success",Message:"Transaction Data", Data : final_data,total_count : values,Code:200});     
//       }
//     }
//   );
//       }
//     }
//   );

//    }
//    else{
//    req.body.start_date = req.body.start_date+'T00:00:00.000Z';
//    req.body.end_date = req.body.end_date+'T00:00:00.000Z';
//    console.log("Dashboard Request",req.body);
//     var final_data = [];
//     transactionModel.aggregate([
//     {$match: {user_id: req.body.user_id,transaction_type:req.body.transaction_type,system_date: {
//     $gte: req.body.start_date,
//     $lte: req.body.end_date
//     }}
//     },
//     {   
//         $group: {
//            _id: {$substr: ['$system_date', 0, 7]}, 
//             price: {$sum: "$transaction_amount"}
//         }
//     }
//     ],
//     function(err,translist) {
//       if (err) {
//         res.send(err);
//       } else {
//         translist.forEach(element => {
//        var splitted = element._id.split("T");
//        element.date = splitted[0];
//        element.credeit_amount = 0;
//        element.debit_amount = 0;
//        });
//         final_data = translist
//       }
//     }
//   );

//   transactionModel.aggregate([
//     {$match: {user_id: req.body.user_id,transaction_way: "Debit",transaction_type:req.body.transaction_type,system_date: {
//     $gte: req.body.start_date,
//     $lte: req.body.end_date
//     }}
//     },
//     {   
//         $group: {
//            _id: {$substr: ['$system_date', 0, 7]}, 
//             price: {$sum: "$transaction_amount"}
//         }
//     }
//     ],
//     function(err,result) {
//       if (err) {
//         res.send(err);
//       } else {
//         console.log(result);
//        for(let a = 0; a < final_data.length; a++){
//        result.forEach(element => {
//        if(element._id == final_data[a]._id)
//        final_data[a].debit_amount = element.price;
//        total_debit_value = total_debit_value + element.price;
//        });
//        }

//     transactionModel.aggregate([
//     {$match: {user_id: req.body.user_id,transaction_way: "Credit",transaction_type:req.body.transaction_type,system_date: {
//     $gte: req.body.start_date,
//     $lte: req.body.end_date
//     }}
//     },
//     {   
//         $group: {
//             _id: {$substr: ['$system_date', 0, 7]}, 
//             price: {$sum: "$transaction_amount"}
//         }
//     }
//     ],
//     function(err,result1) {
//       if (err) {
//         res.send(err);
//       } else {
//         console.log(result1);
//        for(let a = 0; a < final_data.length; a++){
//        result1.forEach(element => {
//        if(element._id == final_data[a]._id)
//        final_data[a].credeit_amount = element.price;
//        total_credit_value = total_credit_value + element.price;
//        });
//        }
//       let values = {
//       total_credit_value : total_credit_value,
//       total_debit_value : total_debit_value,
//       available_balance : total_credit_value - total_debit_value
//       } 
//       res.json({Status:"Success",Message:"Transaction Data", Data : final_data,total_count : values,Code:200});     
//       }
//     }
//   );
//       }
//     }
//   );

//    }
// });


router.post('/movement/report',async function (req, res) {
   var total_credit_value = 0;
   var total_debit_value = 0;
   if(req.body.start_date == '' && req.body.end_date == ''){
    var final_data = [];
    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_type:req.body.transaction_type}
    },
    {   
        $group: {
             _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,translist) {
      if (err) {
        res.send(err);
      } else {
        translist.forEach(element => {
       var splitted = element._id.split("T");
       element.date = splitted[0];
       element.credeit_amount = 0;
       element.debit_amount = 0;
       });
        final_data = translist
      }
    }
  );

  transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way: "Debit",transaction_type:req.body.transaction_type}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,result) {
      if (err) {
        res.send(err);
      } else {
        console.log(result);
       for(let a = 0; a < final_data.length; a++){
       result.forEach(element => {
       if(element._id == final_data[a]._id)
       final_data[a].debit_amount = element.price;
       total_credit_value = total_credit_value + element.price;
       });
       }

    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way: "Credit",transaction_type:req.body.transaction_type}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,result1) {
      if (err) {
        res.send(err);
      } else {
        console.log(result1);
       for(let a = 0; a < final_data.length; a++){
       result1.forEach(element => {
       if(element._id == final_data[a]._id)
       final_data[a].credeit_amount = element.price;
       total_credit_value = total_debit_value + element.price;
       });
       }
       let values = {
      total_credit_value : total_credit_value,
      total_debit_value : total_debit_value,
      available_balance : total_credit_value - total_debit_value
      } 
      res.json({Status:"Success",Message:"Transaction Data", Data : final_data,total_count : values,Code:200});     
      }
    }
  );
      }
    }
  );

   }
   else{
   req.body.start_date = req.body.start_date+'T00:00:00.000Z';
   req.body.end_date = req.body.end_date+'T00:00:00.000Z';
   console.log("Dashboard Request",req.body);
    var final_data = [];
    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_type:req.body.transaction_type,system_date: {
    $gte: req.body.start_date,
    $lte: req.body.end_date
    }}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,translist) {
      if (err) {
        res.send(err);
      } else {
        translist.forEach(element => {
       var splitted = element._id.split("T");
       element.date = splitted[0];
       element.credeit_amount = 0;
       element.debit_amount = 0;
       });
        final_data = translist
      }
    }
  );

  transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way: "Debit",transaction_type:req.body.transaction_type,system_date: {
    $gte: req.body.start_date,
    $lte: req.body.end_date
    }}
    },
    {   
        $group: {
           _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,result) {
      if (err) {
        res.send(err);
      } else {
        console.log(result);
       for(let a = 0; a < final_data.length; a++){
       result.forEach(element => {
       if(element._id == final_data[a]._id)
       final_data[a].debit_amount = element.price;
       total_debit_value = total_debit_value + element.price;
       });
       }

    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way: "Credit",transaction_type:req.body.transaction_type,system_date: {
    $gte: req.body.start_date,
    $lte: req.body.end_date
    }}
    },
    {   
        $group: {
             _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,result1) {
      if (err) {
        res.send(err);
      } else {
        console.log(result1);
       for(let a = 0; a < final_data.length; a++){
       result1.forEach(element => {
       if(element._id == final_data[a]._id)
       final_data[a].credeit_amount = element.price;
       total_credit_value = total_credit_value + element.price;
       });
       }
      let values = {
      total_credit_value : total_credit_value,
      total_debit_value : total_debit_value,
      available_balance : total_credit_value - total_debit_value
      } 
      res.json({Status:"Success",Message:"Transaction Data", Data : final_data,total_count : values,Code:200});     
      }
    }
  );
      }
    }
  );

   }
});

router.post('/transaction/report',async function (req, res) {
   var total_credit_value = 0;
   var total_debit_value = 0;
   if(req.body.start_date == '' && req.body.end_date == ''){
    var final_data = [];
    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,translist) {
      if (err) {
        res.send(err);
      } else {
        translist.forEach(element => {
       var splitted = element._id.split("T");
       element.date = splitted[0];
       element.credeit_amount = 0;
       element.debit_amount = 0;
       });
        final_data = translist
      }
    }
  );

  transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way: "Debit"}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,result) {
      if (err) {
        res.send(err);
      } else {
        console.log(result);
       for(let a = 0; a < final_data.length; a++){
       result.forEach(element => {
       if(element._id == final_data[a]._id)
       final_data[a].debit_amount = element.price;
       total_credit_value = total_credit_value + element.price;
       });
       }

    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way: "Credit"}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,result1) {
      if (err) {
        res.send(err);
      } else {
        console.log(result1);
       for(let a = 0; a < final_data.length; a++){
       result1.forEach(element => {
       if(element._id == final_data[a]._id)
       final_data[a].credeit_amount = element.price;
       total_credit_value = total_debit_value + element.price;
       });
       }
       let values = {
      total_credit_value : total_credit_value,
      total_debit_value : total_debit_value,
      available_balance : total_credit_value - total_debit_value
      } 
      res.json({Status:"Success",Message:"Transaction Data", Data : final_data,total_count : values,Code:200});     
      }
    }
  );
      }
    }
  );

   }
   else{
   req.body.start_date = req.body.start_date+'T00:00:00.000Z';
   req.body.end_date = req.body.end_date+'T00:00:00.000Z';
   console.log("Dashboard Request",req.body);
    var final_data = [];
    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,system_date: {
    $gte: req.body.start_date,
    $lte: req.body.end_date
    }}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,translist) {
      if (err) {
        res.send(err);
      } else {
        translist.forEach(element => {
       var splitted = element._id.split("T");
       element.date = splitted[0];
       element.credeit_amount = 0;
       element.debit_amount = 0;
       });
        final_data = translist
      }
    }
  );

  transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way: "Debit",system_date: {
    $gte: req.body.start_date,
    $lte: req.body.end_date
    }}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,result) {
      if (err) {
        res.send(err);
      } else {
        console.log(result);
       for(let a = 0; a < final_data.length; a++){
       result.forEach(element => {
       if(element._id == final_data[a]._id)
       final_data[a].debit_amount = element.price;
       total_debit_value = total_debit_value + element.price;
       });
       }

    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way: "Credit",system_date: {
    $gte: req.body.start_date,
    $lte: req.body.end_date
    }}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,result1) {
      if (err) {
        res.send(err);
      } else {
        console.log(result1);
       for(let a = 0; a < final_data.length; a++){
       result1.forEach(element => {
       if(element._id == final_data[a]._id)
       final_data[a].credeit_amount = element.price;
       total_credit_value = total_credit_value + element.price;
       });
       }
      let values = {
      total_credit_value : total_credit_value,
      total_debit_value : total_debit_value,
      available_balance : total_credit_value - total_debit_value
      } 
      res.json({Status:"Success",Message:"Transaction Data", Data : final_data,total_count : values,Code:200});     
      }
    }
  );
      }
    }
  );

   }
});


router.post('/income/report',async function (req, res) {
   var total_credit_value = 0;
   var total_debit_value = 0;
   if(req.body.start_date == '' && req.body.end_date == ''){
    var final_data = [];
    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,translist) {
      if (err) {
        res.send(err);
      } else {
        translist.forEach(element => {
       var splitted = element._id.split("T");
       element.date = splitted[0];
       element.credeit_amount = 0;
       element.debit_amount = 0;
       });
        final_data = translist
      }
    }
  );

  transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way: "Debit"}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,result) {
      if (err) {
        res.send(err);
      } else {
        console.log(result);
       for(let a = 0; a < final_data.length; a++){
       result.forEach(element => {
       if(element._id == final_data[a]._id)
       final_data[a].debit_amount = element.price;
       total_credit_value = total_credit_value + element.price;
       });
       }

    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way: "Credit"}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,result1) {
      if (err) {
        res.send(err);
      } else {
        console.log(result1);
       for(let a = 0; a < final_data.length; a++){
       result1.forEach(element => {
       if(element._id == final_data[a]._id)
       final_data[a].credeit_amount = element.price;
       total_credit_value = total_debit_value + element.price;
       });
       }
       let values = {
      total_credit_value : total_credit_value,
      total_debit_value : total_debit_value,
      available_balance : total_credit_value - total_debit_value
      } 
      res.json({Status:"Success",Message:"Income Data", Data : final_data,total_count : values,Code:200});     
      }
    }
  );
      }
    }
  );

   }
   else{
   req.body.start_date = req.body.start_date+'T00:00:00.000Z';
   req.body.end_date = req.body.end_date+'T00:00:00.000Z';
   console.log("Dashboard Request",req.body);
    var final_data = [];
    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,system_date: {
    $gte: req.body.start_date,
    $lte: req.body.end_date
    }}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,translist) {
      if (err) {
        res.send(err);
      } else {
        translist.forEach(element => {
       var splitted = element._id.split("T");
       element.date = splitted[0];
       element.credeit_amount = 0;
       element.debit_amount = 0;
       });
        final_data = translist
      }
    }
  );

  transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way: "Debit",system_date: {
    $gte: req.body.start_date,
    $lte: req.body.end_date
    }}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,result) {
      if (err) {
        res.send(err);
      } else {
        console.log(result);
       for(let a = 0; a < final_data.length; a++){
       result.forEach(element => {
       if(element._id == final_data[a]._id)
       final_data[a].debit_amount = element.price;
       total_debit_value = total_debit_value + element.price;
       });
       }

    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way: "Credit",system_date: {
    $gte: req.body.start_date,
    $lte: req.body.end_date
    }}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,result1) {
      if (err) {
        res.send(err);
      } else {
        console.log(result1);
       for(let a = 0; a < final_data.length; a++){
       result1.forEach(element => {
       if(element._id == final_data[a]._id)
       final_data[a].credeit_amount = element.price;
       total_credit_value = total_credit_value + element.price;
       });
       }
      let values = {
      total_credit_value : total_credit_value,
      total_debit_value : total_debit_value,
      available_balance : total_credit_value - total_debit_value
      } 
      res.json({Status:"Success",Message:"Income Data", Data : final_data,total_count : values,Code:200});     
      }
    }
  );
      }
    }
  );

   }
});



router.post('/expenditure/report',async function (req, res) {
   var total_credit_value = 0;
   var total_debit_value = 0;
   if(req.body.start_date == '' && req.body.end_date == ''){
    var final_data = [];
    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,translist) {
      if (err) {
        res.send(err);
      } else {
        translist.forEach(element => {
       var splitted = element._id.split("T");
       element.date = splitted[0];
       element.credeit_amount = 0;
       element.debit_amount = 0;
       });
        final_data = translist
      }
    }
  );

  transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way: "Debit"}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,result) {
      if (err) {
        res.send(err);
      } else {
        console.log(result);
       for(let a = 0; a < final_data.length; a++){
       result.forEach(element => {
       if(element._id == final_data[a]._id)
       final_data[a].debit_amount = element.price;
       total_credit_value = total_credit_value + element.price;
       });
       }

    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way: "Credit"}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,result1) {
      if (err) {
        res.send(err);
      } else {
        console.log(result1);
       for(let a = 0; a < final_data.length; a++){
       result1.forEach(element => {
       if(element._id == final_data[a]._id)
       final_data[a].credeit_amount = element.price;
       total_credit_value = total_debit_value + element.price;
       });
       }
       let values = {
      total_credit_value : total_credit_value,
      total_debit_value : total_debit_value,
      available_balance : total_credit_value - total_debit_value
      } 
      res.json({Status:"Success",Message:"Expenditure Data", Data : final_data,total_count : values,Code:200});     
      }
    }
  );
      }
    }
  );

   }
   else{
   req.body.start_date = req.body.start_date+'T00:00:00.000Z';
   req.body.end_date = req.body.end_date+'T00:00:00.000Z';
   console.log("Dashboard Request",req.body);
    var final_data = [];
    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,system_date: {
    $gte: req.body.start_date,
    $lte: req.body.end_date
    }}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,translist) {
      if (err) {
        res.send(err);
      } else {
        translist.forEach(element => {
       var splitted = element._id.split("T");
       element.date = splitted[0];
       element.credeit_amount = 0;
       element.debit_amount = 0;
       });
        final_data = translist
      }
    }
  );

  transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way: "Debit",system_date: {
    $gte: req.body.start_date,
    $lte: req.body.end_date
    }}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,result) {
      if (err) {
        res.send(err);
      } else {
        console.log(result);
       for(let a = 0; a < final_data.length; a++){
       result.forEach(element => {
       if(element._id == final_data[a]._id)
       final_data[a].debit_amount = element.price;
       total_debit_value = total_debit_value + element.price;
       });
       }

    transactionModel.aggregate([
    {$match: {user_id: req.body.user_id,transaction_way: "Credit",system_date: {
    $gte: req.body.start_date,
    $lte: req.body.end_date
    }}
    },
    {   
        $group: {
            _id: "$system_date",
            price: {$sum: "$transaction_amount"}
        }
    }
    ],
    function(err,result1) {
      if (err) {
        res.send(err);
      } else {
        console.log(result1);
       for(let a = 0; a < final_data.length; a++){
       result1.forEach(element => {
       if(element._id == final_data[a]._id)
       final_data[a].credeit_amount = element.price;
       total_credit_value = total_credit_value + element.price;
       });
       }
      let values = {
      total_credit_value : total_credit_value,
      total_debit_value : total_debit_value,
      available_balance : total_credit_value - total_debit_value
      } 
      res.json({Status:"Success",Message:"Expenditure Data", Data : final_data,total_count : values,Code:200});     
      }
    }
  );
      }
    }
  );

   }
});




router.post('/dashboard/data',async function (req, res) {
   let user_details  =  await userdetailsModel.findOne({_id:req.body.user_id});
   console.log(user_details);
   var total_count = 0;
   var numbers = '';
   if(user_details.roll_type == "Child"){
     numbers = user_details.parent_of;
     var count_1  =  await userdetailsModel.find({parent_of:numbers}).count();
     var count_2  =  await userdetailsModel.find({parent_code:numbers}).count();
     total_count = count_1 + count_2;
   }
   if(user_details.roll_type == "Admin"){
     numbers = user_details.parent_code;
     var count_1  =  await userdetailsModel.find({parent_of:numbers}).count();
     var count_2  =  await userdetailsModel.find({parent_code:numbers}).count();
     total_count = count_1 + count_2;
   }
   console.log(total_count);
   let f = {
    child_count : count_1,
    admin_count : count_2,
    total_count : total_count
   }
   console.log(f);
   req.body.start_date = req.body.start_date+'T00:00:00.000Z';
   req.body.end_date = req.body.end_date+'T00:00:00.000Z';
   console.log("Dashboard Request",req.body);
   if(req.body.transaction_type == '')
   {
   let Credit_amount  =  await transactionModel.find({
    system_date: {
    $gte: req.body.start_date,
    $lte: req.body.end_date
    },
    user_id:req.body.user_id,transaction_way:req.body.transaction_way
    });
    var fin_credit = 0;
    var fin_debit = 0;
   Credit_amount.forEach(element => {
    if(element.transaction_way == "Credit"){
     fin_credit = +fin_credit + +element.transaction_amount;  
    }
   });
   Credit_amount.forEach(element => {
    if(element.transaction_way == "Debit"){
     fin_debit = +fin_debit + +element.transaction_amount;
    }
    });
    let c = {
    Credit_amount : fin_credit,
    Debit_amount : fin_debit,
    Balance_amount : fin_credit - fin_debit,
    }
   res.json({Status:"Success",Message:"Filter dashboard", Data : Credit_amount , balance : c , user_count : f ,Code:200});
   }
   else
   {
    let Credit_amount  =  await transactionModel.find({
    system_date: {
    $gte: req.body.start_date,
    $lte: req.body.end_date
    },
    user_id:req.body.user_id,transaction_way:req.body.transaction_way,transaction_type:req.body.transaction_type
    });
    var fin_credit = 0;
    var fin_debit = 0;
    Credit_amount.forEach(element => {
    if(element.transaction_way == "Credit"){
     fin_credit = +fin_credit + +element.transaction_amount;  
    }
    });
    Credit_amount.forEach(element => {
    if(element.transaction_way == "Debit"){
     fin_debit = +fin_debit + +element.transaction_amount;
    }
    });
    let c = {
    Credit_amount : fin_credit,
    Debit_amount : fin_debit,
    Balance_amount : fin_credit - fin_debit,
    }
    res.json({Status:"Success",Message:"Filter dashboard", Data : Credit_amount , balance : c , user_count : f ,Code:200});
   }        
});



router.post('/accountsummery/data',async function (req, res) {
   let user_details  =  await userdetailsModel.findOne({_id:req.body.user_id});
   console.log(user_details);
   var total_count = 0;
   var numbers = '';
   if(user_details.roll_type == "Child"){
     numbers = user_details.parent_of;
     var count_1  =  await userdetailsModel.find({parent_of:numbers}).count();
     var count_2  =  await userdetailsModel.find({parent_code:numbers}).count();
     total_count = count_1 + count_2;
   }
   if(user_details.roll_type == "Admin"){
     numbers = user_details.parent_code;
     var count_1  =  await userdetailsModel.find({parent_of:numbers}).count();
     var count_2  =  await userdetailsModel.find({parent_code:numbers}).count();
     total_count = count_1 + count_2;
   }
   console.log(total_count);
   let f = {
    child_count : count_1,
    admin_count : count_2,
    total_count : total_count
   }
   console.log(f);
   console.log("Dashboard Request",req.body);
   let Credit_amount  =  await transactionModel.find({user_id:req.body.user_id});
    var fin_credit = 0;
    var fin_debit = 0;
   Credit_amount.forEach(element => {
    if(element.transaction_way == "Credit"){
     fin_credit = +fin_credit + +element.transaction_amount;  
    }
   });
   Credit_amount.forEach(element => {
    if(element.transaction_way == "Debit"){
     fin_debit = +fin_debit + +element.transaction_amount;
    }
    });
    let c = {
    Credit_amount : fin_credit,
    Debit_amount : fin_debit,
    Balance_amount : fin_credit - fin_debit,
    }
   res.json({Status:"Success",Message:"account summery  data", Data : Credit_amount , balance : c , user_count : f ,Code:200});
});


router.get('/getlist', function (req, res) {
        transactionModel.find({}, function (err, Functiondetails) {
          res.json({Status:"Success",Message:"transaction Details", Data : Functiondetails ,Code:200});
        });
});


router.post('/edit', function (req, res) {
        transactionModel.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, UpdatedDetails) {
            if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
             res.json({Status:"Success",Message:"transaction Updated", Data : UpdatedDetails ,Code:200});
        });
});
// // DELETES A USER FROM THE DATABASE
router.post('/delete', function (req, res) {
      transactionModel.findByIdAndRemove(req.body._id, function (err, user) {
          if (err) return res.json({Status:"Failed",Message:"Internal Server Error", Data : {},Code:500});
          res.json({Status:"Success",Message:"transaction Deleted successfully", Data : {} ,Code:200});
      });
});

module.exports = router;

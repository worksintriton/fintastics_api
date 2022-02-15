var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var budgetModel = require('./../models/budgetModel');
const transactionModel = require('../models/transactionModel');


router.post('/create', async function (req, res) {
  try {
    await budgetModel.create({
      budget_userid: req.body.budget_userid,
      budget_title: req.body.budget_title,
      budget_type: req.body.budget_type,
      budget_period_type: req.body.budget_period_type,
      budget_amount: req.body.budget_amount,
      budget_currency: req.body.budget_currency,
      budget_cat: req.body['budget_cat[]'],
      budget_account: req.body['budget_account[]'],
      budget_start_date: req.body.budget_start_date,
      budget_end_date: req.body.budget_end_date,
      budget_value: req.body.budget_value,
      budget_head_type: req.body.budget_head_type,
      budget_notification: req.body.budget_notification,
      delete_status: false,
    },
      function (err, budget) {
        console.log(budget)
        res.json({ Status: "Success", Message: "Added successfully", Data: budget, Code: 200 });
      });
  }
  catch (e) {
    res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
  }
});


router.get('/deletes', function (req, res) {
  budgetModel.remove({}, function (err, user) {
    if (err) return res.status(500).send("There was a problem deleting the user.");
    res.json({ Status: "Success", Message: "Budget Deleted", Data: {}, Code: 200 });
  });
});


router.post('/getlist_id', function (req, res) {
  budgetModel.find({ Person_id: req.body.Person_id, delete_status: false }, function (err, StateList) {
    res.json({ Status: "Success", Message: "Budget List", Data: StateList, Code: 200 });
  });
});



router.get('/getlist', function (req, res) {
  try {
    let skip = 0, limit = 10;
    let params = { delete_status: false };
    if (req.query.skip) {
      skip = parseInt(req.query.skip);
    }
    if (req.query.limit) {
      limit = parseInt(req.query.limit);
    }
    if (req.query.status) {
      if (req.query.status === 'Active') {
        //params.budget_start_date = { $lte: new Date().toISOString() }
        params.budget_end_date = { $gte: new Date() }
      }
      else if (req.query.status === 'Closed') {
        params.budget_end_date = { $lte: new Date() }
      }
    }
    if (req.query.period_type) {
      params.budget_period_type = req.query.period_type;
    }
    if (req.query.userid) {
      params.budget_userid = req.query.userid;
    }
    //let trans_params = { delete_status: false, transaction_way: 'Debit1' };
    let aggr_params = [{ "$match": params }, { "$unset": ["createdAt", "updatedAt", "delete_status"] },
    { "$addFields": { "totalExpense": 0 } }];
    if (skip > 0) {
      aggr_params.push({ "$skip": skip });
    }
    if (limit > 0) {
      aggr_params.push({ "$limit": limit });
    }

    /*{
       '$lookup': {
         'from': 'transactions',
         'localField': '_id',
         'foreignField': 'transaction_budget_id',
         'as': 'transactions',
         'let': { 'transaction_amount': "$transaction_amount" },
         'pipeline': [
           {
             '$match': { trans_params }
           }
         ]
       }
     },
     { '$unwind': '$transactions' },
     {
       '$group': {
         '_id': '$_id',
         'detail': { $first: '$$ROOT' },
         'totalExpense': { '$sum': "$transaction_amount" }
       },
     },
     {
       $replaceRoot: {
         newRoot: { $mergeObjects: [{ totalExpense: '$totalExpense' }, '$detail'] },
       },
     }*/

    budgetModel.aggregate(aggr_params).exec(async function (err, budget_list) {
      let budget_list_id = budget_list.map(x => { return String(x._id) });
      let trans_params = { delete_status: false, transaction_budget_id: { $in: budget_list_id }, transaction_way: 'Debit' }
      await transactionModel.aggregate([
        {
          "$match": trans_params
        },
        {
          "$group": {
            "_id": "$transaction_budget_id",
            "totalExpense": { "$sum": "$transaction_amount" }
          }
        }
      ]).exec(function (trans_err, transaction_list) {
        if (trans_err) { console.log(trans_err); return false; }
        transaction_list.forEach(x => {
          let filter = budget_list.filter(x1 => String(x1._id) === String(x._id));
          if (filter.length > 0) {
            filter[0]['totalExpense'] = x["totalExpense"];
          }
        });
        res.json({ Status: "Success", Message: "Budget Details", Data: budget_list, Code: 200 });
      });
    });
  }
  catch (ex) {
    res.json({ Status: "Failure", Error: ex.message, Code: 400 });
  }
});


router.post('/edit', function (req, res) {
  budgetModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Budget Updated", Data: UpdatedDetails, Code: 200 });
  });
});
// // DELETES A USER FROM THE DATABASE
router.post('/delete', function (req, res) {
  budgetModel.findByIdAndRemove(req.body._id, function (err, user) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Budget Deleted successfully", Data: {}, Code: 200 });
  });
});



//////Mani Code///////

router.post('/getFilterDatas', function (req, res) {
  console.log("req.body", req.body);

  var startDate = new Date(req.body.data.startDate);
  var endDate = new Date(req.body.data.endDate);
  if (new Date() == startDate) {
    startDate.setDate(startDate.getDate());
    endDate.setDate(endDate.getDate());
  } else {
    startDate.setDate(startDate.getDate());
    endDate.setDate(endDate.getDate() + 1);
  }
  console.log("startDate", startDate);
  console.log("endDate", endDate);
  matchQuery = { $and: [{ "createdAt": { $gte: startDate.toISOString() } }, { "createdAt": { $lte: endDate.toISOString() } }] };

  budgetModel.aggregate(
    [
      {
        $match: matchQuery

      },
    ],
    function (err, data) {
      if (err) {
        return commonUtil.makeErrorResponse(res, err, "", "");
      } else {
        res.json({ Status: "Success", Message: "Budget Filter Datas List", Data: data, Code: 200 });
      }
    }
  );
});

router.get('/years', function (req, res) {
  let years = [];
  for (let i = 2022; i < 2030; i++) {
    years.push(i);
  }
  res.send({ Status: "Success", Message: "Years List", Data: years, Code: 200 });
});


module.exports = router;

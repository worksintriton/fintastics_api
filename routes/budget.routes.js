var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var budgetModel = require('./../models/budgetModel');
const transactionModel = require('../models/transactionModel');
const userdetailsModel = require('../models/userdetailsModel');
const { Mongoose } = require('mongoose');
const moment = require('moment');

router.post('/create', async function (req, res) {
  console.log(req.body);
  try {
    await budgetModel.create({
      budget_userid: req.body.budget_userid,
      budget_title: req.body.budget_title,
      budget_type: req.body.budget_type,
      budget_period_type: req.body.budget_period_type,
      budget_amount: req.body.budget_amount,
      budget_currency: req.body.budget_currency,
      budget_currency_symbol: req.body.budget_currency_symbol,
      budget_cat: req.body.budget_cat,
      budget_cat_all: req.body.budget_cat_all,
      budget_account: req.body.budget_account,
      budget_account_all: req.body.budget_account_all,
      budget_start_date: req.body.budget_start_date,
      budget_end_date: req.body.budget_end_date,
      budget_value: req.body.budget_value,
      budget_head_type: req.body.budget_head_type,
      budget_notification: req.body.budget_notification,
      delete_status: false,
    },
      async function (err, budget) {
        if (err) {
          res.json({ Status: "Failed", Message: err.message, Code: 500 });
        } else {

          let params = {
            user_id: req.body.budget_userid,
            notify_title: 'New Budget Plan Created',
            notify_descri: 'Created budget plan ' + req.body.budget_title + " " + (req.body.budget_period_type === "Custom" ? "Onetime" : req.body.budget_period_type),
            notify_img: '/images/notification/new-budget.png',
            notify_color: '#322274',
          };
          global.push_notification(params);

          let parent = await userdetailsModel.findById(req.body.budget_userid);
          if (parent != null) {
            let childs = await userdetailsModel.find({ "parent_of": parent_code = parent.parent_code });
            for (let i = 0; i < childs.length; i++) {
              params.user_id = childs[i]._id;
              global.push_notification(params);
            }
          }

          res.json({ Status: "Success", Message: "Added successfully", Data: budget, Code: 200 });
        }
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

async function getlist(params, res){
  try {
    let skip = 0, limit = 10, timezone = "+0530";
    let params = { delete_status: false };
    let aggr_params = [
      {
        "$addFields": {
          "totalExpense": 0,
          id: { "$toString": "$_id" },
          year: { $year: { date: "$budget_start_date", timezone: timezone } },
          month: { $month: { date: "$budget_start_date", timezone: timezone } },
          week: { $week: { date: "$budget_start_date", timezone: timezone } },
          /*month_week: { $add: [1, { $floor: { $divide: [{ $dayOfMonth: "$budget_start_date" }, 7] } }] },
          day_of_week: { $subtract: [{ $dayOfWeek: { date: "$budget_start_date", timezone: timezone } }, 1] },
          day_of_month: { $dayOfMonth: { date: "$budget_start_date", timezone: timezone } },
          mod1: { $mod: [{ $add: [{ $subtract: [{ $dayOfWeek: { date: "$budget_start_date", timezone: timezone } }, 1] }, 7] }, 7] },
          sub1: { $subtract: [{ $dayOfMonth: { date: "$budget_start_date", timezone: timezone } }, { $mod: [{ $add: [{ $dayOfWeek: { date: "$budget_start_date", timezone: timezone } }, 7] }, 7] }] },*/
          month_week: { $add: [{ $ceil: { $divide: [{ $subtract: [{ $dayOfMonth: { date: "$budget_start_date", timezone: timezone } }, { $mod: [{ $add: [{ $subtract: [{ $dayOfWeek: { date: "$budget_start_date", timezone: timezone } }, 1] }, 7] }, 7] }] }, 7] } }, 1] }
        }
      }];
    if (params.skip) {
      skip = parseInt(params.skip);
    }
    if (params.limit) {
      limit = parseInt(params.limit);
    }
    if (params.userid) {
      let userids = [params.userid];
      let useragg = userdetailsModel.aggregate([{ "$match": { "_id": new Mongoose().Types.ObjectId(params.userid) } },
      {
        "$lookup": {
          "from": "userdetails",
          "localField": "parent_of",
          "foreignField": "parent_code",
          "as": "parent"
        }
      }]);
      await useragg.exec().then(function (userlist) {
        if (userlist.length > 0) {
          userids.push(userlist[0].parent[0]._id.toString());
        }
      });
      params.budget_userid = { "$in": userids };
    }
    if (params.status) {
      if (params.status === 'Active') {
        params.budget_end_date = { $gte: new Date(new Date().toDateString()) }
      }
      else if (params.status === 'Closed') {
        params.budget_end_date = { $lt: new Date(new Date().toDateString()) }
      }
    }
    if (params.period_type) {
      params.budget_period_type = params.period_type;
    }
    if (params.year) {
      params.year = parseInt(params.year);
    }
    if (params.month) {
      params.month = parseInt(params.month);
    }
    if (params.month_week) {
      params.month_week = parseInt(params.month_week);
    }
    if (params.start_date && params.end_date) {
      params.budget_start_date = { $gte: new Date(params.start_date), $lte: new Date(params.end_date + "T23:59:59") };
    }
    else if (params.start_date) {
      params.budget_start_date = { $gte: new Date(params.start_date) };
    }
    else if (params.end_date) {
      params.budget_start_date = { $lte: new Date(params.end_date) };
    }
    if (params.timezone) {
      timezone = params.timezone;
    }
    if (params.id) {
      params.id = params.id;
    }
    let trans_params = { delete_status: false, transaction_way: 'Debit' };
    aggr_params.push({ "$match": params });
    aggr_params.push({
      '$lookup': {
        'from': 'transactions',
        'localField': 'id',
        'foreignField': 'transaction_budget_id',
        'as': 'transactions',
        'pipeline': [
          {
            '$match': trans_params,
          },
          {
            '$project': { 'createdAt': 0, 'updatedAt': 0, 'delete_status': 0, '__v': 0, 'transaction_budget_id': 0 }
          }
        ]
      }
    });
    aggr_params.push({ "$unset": ["createdAt", "updatedAt", "delete_status", "__v", "id", "child", "parent"] });

    if (skip > 0) {
      aggr_params.push({ "$skip": skip });
    }
    if (limit > 0) {
      aggr_params.push({ "$limit": limit });
    }
    aggr_params.push({ '$sort': { '_id': -1 } });
    budgetModel.aggregate(aggr_params).exec(async function (err, budget_list) {
      if (err) { console.log(err); res.json({ Status: "Failure", Error: err.message, Code: 400 }); }
      budget_list.forEach(x => {
        x.transactions.forEach(x1 => {
          x1.transaction_date = new Date(x1.transaction_date).toLocaleDateString("en-CA") + " " + new Date(x1.transaction_date).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
          x1.createdAt = new Date(x1.createdAt).toLocaleDateString("en-CA") + " " + new Date(x1.createdAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
          x.totalExpense += x1.transaction_amount;
        });
        if (!params.with_transactions || params.with_transactions === 'false') {
          delete x.transactions;
        }
      });
      let resResult = [];
      if (params.groupby) {
        switch (params.groupby.toLowerCase()) {
          case "weekly":
            budget_list.reduce(function (result, current) {
              let subresResult = resResult.filter(x => x.name === current.month_week);
              if (subresResult.length > 0) {
                subresResult[0].details.push(current);
              }
              else {
                resResult.push({ name: current.month_week, details: [current] });
              }
              return result;
            }, {});
            break;
          case "monthly":
            budget_list = budget_list.reduce(function (result, current) {
              let subresResult = resResult.filter(x => x.name === current.month);
              if (subresResult.length > 0) {
                subresResult[0].details.push(current);
              }
              else {
                resResult.push({ name: current.month, details: [current] });
              }
              return result;
            }, {});
            break;
          case "annually":
            budget_list = budget_list.reduce(function (result, current) {
              let subresResult = resResult.filter(x => x.name === current.year);
              if (subresResult.length > 0) {
                subresResult[0].details.push(current);
              }
              else {
                resResult.push({ name: current.year, details: [current] });
              }
              return result;
            }, {});
            break;
          default:
            resResult = budget_list;
            break;
        }
      }
      else {
        resResult = budget_list;
      }

      res.json({ Status: "Success", Message: "Budget Details", Data: resResult, Code: 200 });
    });
  }
  catch (ex) {
    res.json({ Status: "Failure", Error: ex.message, Code: 400 });
  }
}

router.get('/getlist', async function (req, res) {
  getlist(req.query,res);
});

router.post('/getlist', async function (req, res) {
  getlist(req.body,res);
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
  for (let i = 2022; i <= 2030; i++) {
    years.push(i);
  }
  res.send({ Status: "Success", Message: "Years List", Data: years, Code: 200 });
});

function changeTZ(date1, timezone1) {
  return new Date((typeof date1 === "string" ? new Date(date1) : date1).toLocaleString("en-US", { timeZone: timezone1 }));
}

router.post("/budget_graph", async function (req, res) {
  try {
    let budget = await budgetModel.findOne({ _id: req.body.budget_id },
      { budget_period_type: 1, budget_start_date: 1, budget_end_date: 1 });

    let bottom_list = [], result = [];
    let budget_start_date = budget.budget_start_date;
    let budget_end_date = budget.budget_end_date;
    switch (budget.budget_period_type) {
      case "Custom":
      case "Weekly":
      case "Monthly":
        if (budget_start_date < budget_end_date) {
          while (budget_start_date <= budget_end_date) {
            bottom_list.push(budget_start_date.toLocaleDateString("en-CA"));
            result.push([]);
            budget_start_date.setDate(budget_start_date.getDate() + 1);
          }
        }
        break;
      case "Annually":
        if (budget_start_date < budget_end_date) {
          while (budget_start_date <= budget_end_date) {
            //bottom_list.push(String(budget_start_date.getMonth() + 1));
            bottom_list.push(budget_start_date.toLocaleDateString("en-US", { month: 'short' }));
            result.push([]);
            budget_start_date.setMonth(budget_start_date.getMonth() + 1);
          }
        }
        break;
    }

    let budget1 = await budgetModel.findOne({ _id: req.body.budget_id },
      { budget_period_type: 1, budget_start_date: 1, budget_end_date: 1 });
    let aggr = [
      {
        $match: {
          transaction_budget_id: req.body.budget_id,
          transaction_date: { $gte: budget1.budget_start_date, $lte: budget1.budget_end_date },
          delete_status: false
        }
      }
    ];
    if (budget1.budget_period_type === 'Annually') {
      aggr.push({
        $group: {
          _id: { $month: { date: "$transaction_date", timezone: req.body.timezone } },
          transaction_amount: { $sum: "$transaction_amount" }
        }
      }, {
        $addFields: { "transaction_date": "$_id" }
      });
    }
    aggr.push({ $project: { transaction_date: 1, transaction_amount: 1 } },
      { $sort: { transaction_date: 1 } });

    transactionModel.aggregate(aggr).exec(async function (err, transactions) {
      if (err) {
        res.json({ Status: "Failed", Message: err.message, Code: 400 })
      }
      let result = [];
      let maxlength = 0;
      bottom_list.forEach((x, i) => {
        transactions.forEach(transaction => {
          if (budget.budget_period_type === "Annually") {
            let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            if (months[transaction._id - 1] === x) {
              result[i].push(transaction.transaction_amount);
            }
          } else {
            if (transaction.transaction_date.toLocaleDateString("en-CA") === x) {
              result[i].push(transaction.transaction_amount);
              if (budget.budget_period_type === "Custom") {
                if (transaction.transaction_amount === 0) {
                  bottom_list[i].remove();
                  result[i].remove();
                }
              }
            }
          }
        });
        switch (budget.budget_period_type) {
          case "Custom":
            bottom_list[i] = moment(x).tz(req.body.timezone).format("DD-MM-YY"); //new Date(x).toLocaleString("en-GB").substring(0, 5);
            break;
          case "Weekly":
          case "Monthly":
            bottom_list[i] = new Date(x).toLocaleDateString("en-GB").substring(0, 2);
            break;
        }
        if (result[i].length > maxlength) {
          maxlength = 0;
        }
      });

      result.forEach(x => {
        if (x.length < maxlength) {
          for (let j = x.length; j < maxlength; j++) {
            x.push(0);
          }
        }
      });
      result.forEach(x => {
        if (x.length === 0) {
          x.push(0);
        }
      });
      if (budget.budget_period_type === "Custom") {
        for (let i = 0; i < result.length; i++) {
          if (result.length === 1) {
            if (result[0] === 0) {
              bottom_list.splice(i, 1);
              result.split(i, 1);
              i--;
            }
          }
        }
      }
      let response = { Graph: { bottomlist: bottom_list, val: result } };
      res.json({ Status: "Success", Data: response, Code: 200 })
    });
  }
  catch (ex) {
    res.json({ Status: "Failed", Message: ex.message, Code: 400 })
  }
});

module.exports = router;

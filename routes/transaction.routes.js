var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var transactionModel = require('./../models/transactionModel');
var userdetailsModel = require('./../models/userdetailsModel');
var notificationModel = require('./../models/notificationModel');
const subscriptionModel = require('../models/subscriptionModel');
const budgetModel = require('../models/budgetModel');
const moment = require('moment-timezone');

router.post('/create', async function (req, res) {
  let valid = true;
  if (req.body.transaction_budget_id !== "") {
    let budget = await budgetModel.findById(req.body.transaction_budget_id);
    if (budget != null && !(new Date(req.body.transaction_date) >= new Date(budget.budget_start_date) &&
      new Date(req.body.transaction_date) <= new Date(budget.budget_end_date))) {
      valid = false;
      let msg = "This Budget Limit is only valid from " + new Date(budget.budget_start_date).toLocaleDateString("en-IN", { month: 'short', day: '2-digit', year: '2-digit' }) + " to " + new Date(budget.budget_end_date).toLocaleDateString("en-IN", { month: 'short', day: '2-digit', year: '2-digit' }) + ". Edit the date.";
      res.json({ Status: "Success", Message: msg, budget_msg: msg, Code: 400 });
    }
  }
  if (valid) {
    system_date = req.body.transaction_date.substring(0, req.body.transaction_date.indexOf(" "));
    if (req.body.transaction_sub_desc == "") {
      req.body.transaction_sub_desc = null;
    }
    try {
      await transactionModel.create({
        transaction_date: req.body.transaction_date,
        transaction_type: req.body.transaction_type,
        transaction_desc: req.body.transaction_desc,
        transaction_sub_desc: req.body.transaction_sub_desc,
        transaction_way: req.body.transaction_way,
        transaction_amount: req.body.transaction_amount,
        transaction_balance: req.body.transaction_balance,
        transaction_currency_type: req.body.transaction_currency_type || "INR",
        transaction_currency_symbol: req.body.transaction_currency_symbol,
        system_date: system_date,
        user_id: req.body.user_id,
        parent_code: req.body.parent_code,
        delete_status: false,
        transaction_budget_id: req.body.transaction_budget_id
      },
        async function (err, transaction) {
          if (err) {
            res.json({ Status: "Failed", Message: err.message, Code: 500 });
          } else {

            global.push_notification({
              user_id: req.body.user_id,
              notify_title: 'Transaction Added',
              notify_descri: 'A new transaction has been added',
              notify_img: '/images/notification/transaction-added.png',
              notify_color: '#322274',
            });

            let current_user = await userdetailsModel.findById(req.body.user_id);
            let parent = null;
            if (req.body.transaction_budget_id === "" && current_user != null && current_user.parent_of !== "") {
              parent = await userdetailsModel.findOne({ parent_code: current_user.parent_of });
              if (parent != null) {
                global.push_notification({
                  user_id: parent._id,
                  notify_title: 'Member Transaction',
                  notify_descri: 'A new transaction on ' + (req.body.transaction_way === 'Credit' ? 'Income' : 'Expense') + " has been added for " + (parseFloat(req.body.transaction_amount).toFixed(2)) + " by " + (current_user.first_name + " " + current_user.last_name),
                  notify_img: '/images/notification/transaction-added.png',
                  notify_color: '#322274',
                });
              }
            }

            if (req.body.transaction_budget_id !== "") {
              let parentkey = current_user.parent_of !== "" ? current_user.parent_of : current_user.parent_code;
              await userdetailsModel.aggregate([{ $match: { $or: [{ "parent_of": parentkey }, { "parent_code": parentkey }] } }]).exec(async function (err, others) {
                for (let i = 0; i < others.length; i++) {
                  if (others[i]._id != req.body.user_id) {
                    global.push_notification({
                      user_id: others[i]._id,
                      notify_title: (others[i].parent_of !== "" && current_user.parent_code !== "" ? 'Admin Transaction' : 'Member Transaction'),
                      notify_descri: 'A new transaction on ' + (req.body.transaction_way === 'Credit' ? 'Income' : 'Expense') + " has been added for " + (parseFloat(req.body.transaction_amount).toFixed(2)) + " by " + (current_user.first_name + " " + current_user.last_name),
                      notify_img: '/images/notification/transaction-added.png',
                      notify_color: '#322274',
                    });
                  }
                }
              });
            }

            let budget_msg = "";
            if (req.body.transaction_budget_id !== "") {
              await budgetModel.findById(req.body.transaction_budget_id, async function (err, budget) {
                if (budget !== null && budget.budget_notification) {
                  let budget_msg = "Transaction added for your " + (budget.budget_period_type === "Custom" ? "Onetime" : budget.budget_period_type) + " budget " + budget.budget_title;
                  let aggr = [
                    {
                      $match: { transaction_budget_id: req.body.transaction_budget_id, transaction_way: "Debit" }
                    },
                    {
                      $group: {
                        _id: "$transaction_budget_id",
                        total: { $sum: "$transaction_amount" }
                      }
                    }
                  ];
                  await transactionModel.aggregate(aggr, async function (err, transactions) {
                    if (transactions.length > 0) {
                      let notify_params = { user_id: req.body.user_id };
                      if (transactions[0].total > budget.budget_amount) {
                        budget_msg = "The " + (budget.budget_period_type === "Custom" ? "Onetime" : budget.budget_period_type) + " budget plan \"" + budget.budget_title + "\" has gone over its limit";
                        notify_params.notify_title = "Budget Exceeded";
                        notify_params.notify_descri = "The " + (budget.budget_period_type === "Custom" ? "Onetime" : budget.budget_period_type) + " budget plan " + budget.budget_title + " has exceeded its limit ";
                        notify_params.notify_color = "#E80F0F";
                        notify_params.notify_img = '/images/notification/budget-exceeded.png';
                        global.push_notification(notify_params);

                        if (parent != null) {
                          notify_params.user_id = parent._id;
                          global.push_notification(notify_params);

                          let childs = await userdetailsModel.find({ "parent_of": parent.parent_code });
                          for (let i = 0; i < childs.length; i++) {
                            if (childs[i]._id != req.body.user_id) {
                              notify_params.user_id = childs[i]._id;
                              global.push_notification(params);
                            }
                          }
                        }
                      }
                      else if (((transactions[0].total / budget.budget_amount) * 100) > 90) {
                        budget_msg = "Almost 90% of your " + budget.budget_title + " budget of " + budget.budget_currency + "." + budget.budget_amount + " for " + budget.budget_title + " has been spent.";
                        notify_params.notify_title = 'Budget Warning';
                        notify_params.notify_descri = "Your " + (budget.budget_period_type === "Custom" ? "Onetime" : budget.budget_period_type) + " budget limit for " + budget.budget_title + " is about to exceed " + budget.budget_currency_symbol + transactions[0].total + " of " + budget.budget_currency_symbol + budget.budget_amount + ".";
                        notify_params.notify_color = "#E8C50F";
                        notify_params.notify_img = '/images/notification/budget-warning.png';
                        global.push_notification(notify_params);

                        if (parent != null) {
                          notify_params.user_id = parent._id;
                          global.push_notification(notify_params);

                          let childs1 = await userdetailsModel.find({ "parent_of": parent.parent_code });
                          for (let i = 0; i < childs1.length; i++) {
                            if (child[i]._id != req.body.user_id) {
                              params.user_id = childs[i]._id;
                              global.push_notification(params);
                            }
                          }
                        }
                      }
                    }
                    res.json({ Status: "Success", Message: "Added successfully", Data: transaction, budget_msg: budget_msg, Code: 200 });
                  });
                }
                else {
                  res.json({ Status: "Success", Message: "Added successfully", Data: transaction, budget_msg: budget_msg, Code: 200 });
                }
              });
            }
            else {
              res.json({ Status: "Success", Message: "Added successfully", Data: transaction, budget_msg: budget_msg, Code: 200 });
            }
          }
        });
    }
    catch (e) {
      res.json({ Status: "Failed", Message: ex.message, Code: 500 });
    }
  }
});


router.get('/deletes', function (req, res) {
  transactionModel.remove({}, function (err, user) {
    if (err) return res.status(500).send("There was a problem deleting the user.");
    res.json({ Status: "Success", Message: "transaction Deleted", Data: {}, Code: 200 });
  });
});



router.post('/budget_getlist_id', function (req, res) {
  var total_value = 0;
  var expend_value = 0;
  var income_data = [];
  for (let c = 0; c < 12; c++) {
    let dc = {
      spend_amount: 0,
      income_amount: 0,
      available_amount: 0
    }
    income_data.push(dc);
  }
  console.log(income_data);
  transactionModel.aggregate([
    {
      $match: { user_id: req.body.user_id, transaction_way: "Credit" }
    },
    {
      $group: {
        _id: "$transaction_way",
        price: { $sum: "$transaction_amount" }
      }
    }
  ],
    function (err, translist) {
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



  function call2() {
    transactionModel.aggregate([
      {
        $match: { user_id: req.body.user_id, transaction_way: "Credit" }
      },
      {
        $group: {
          _id: { $substr: ['$system_date', 5, 2] },
          price: { $sum: "$transaction_amount" }
        }
      }
    ],
      function (err, translist) {
        if (err) {
          res.send(err);
        } else {
          translist.forEach(element => {
            console.log(element);
            let index = +element._id - 1;
            console.log('index', index);
            income_data[index].income_amount = element.price;
            income_data[index].available_amount = element.price;
          });

          console.log(income_data);
          call3();
        }
      }
    );
  }



  function call3() {
    transactionModel.aggregate([
      {
        $match: { user_id: req.body.user_id, transaction_way: "Debit" }
      },
      {
        $group: {
          _id: { $substr: ['$system_date', 5, 2] },
          price: { $sum: "$transaction_amount" }
        }
      }
    ],
      function (err, translist) {
        if (err) {
          res.send(err);
        } else {
          translist.forEach(element => {
            console.log(element);
            let index = +element._id - 1;
            console.log('index', index);
            income_data[index].spend_amount = element.price;
            income_data[index].available_amount = income_data[index].available_amount - element.price;
          });

          console.log(income_data);
          call4();
        }
      }
    );
  }


  function call4() {
    transactionModel.aggregate([
      {
        $match: { user_id: req.body.user_id, transaction_way: "Debit" }
      },
      {
        $group: {
          _id: "$transaction_type",
          price: { $sum: "$transaction_amount" },
          percentage: { $sum: "$transaction_amount" }
        }
      }
    ],
      function (err, translist) {
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
          expensive_data: translist,
          income_data: income_data,
          expend_value: expend_value,
          total_income: total_value
        }
        res.json({ Status: "Success", Message: "transaction List", Data: datas, Code: 200 });
      }
    );
  }
});

router.post('/getlist_id', function (req, res) {
  transactionModel.find({ Person_id: req.body.Person_id }, function (err, StateList) {
    res.json({ Status: "Success", Message: "transaction List", Data: StateList, Code: 200 });
  });
});



router.post('/get_balance_amount', async function (req, res) {
  let Balance_amount = 0;
  let Credit_amount = await transactionModel.find({ user_id: req.body.user_id, "transaction_way": "Credit" });
  let Debit_amount = await transactionModel.find({ user_id: req.body.user_id, "transaction_way": "Debit" });
  let fin_credit = 0;
  let fin_debit = 0;
  Credit_amount.forEach(element => {
    fin_credit = +fin_credit + +element.transaction_amount;
  });
  Debit_amount.forEach(element => {
    fin_debit = +fin_debit + +element.transaction_amount;
  });
  console.log(fin_credit, fin_debit);
  Balance_amount = fin_credit - fin_debit;
  let data = {
    Credit_amount: fin_credit,
    Debit_amount: fin_debit,
    Balance_amount: Balance_amount
  }
  res.json({ Status: "Success", Message: "Total Available Balance", Data: data, Code: 200 });
});

router.post('/income/report', async function (req, res) {
  income_expense_report(req, res, 'Credit');
});

router.post('/expenditure/report', async function (req, res) {
  income_expense_report(req, res, 'Debit');
});
async function income_expense_report(req, res, filter) {
  try {
    let params = { user_id: req.body.user_id }
    if (req.body.start_date && req.body.end_date && req.body.start_date !== '' && req.body.end_date !== '') {
      req.body.start_date = new Date(new Date(req.body.start_date).toISOString());
      req.body.end_date = new Date(new Date(req.body.end_date + 'T23:59:59Z').toISOString());
      params.system_date = {
        $gte: req.body.start_date,
        $lte: req.body.end_date
      }
    }
    let aggr = [
      {
        $match: params
      },
      {
        "$group": {
          "_id": {
            "transaction_way": "$transaction_way",
            "transaction_currency_type": "$transaction_currency_type",
            "system_date": { $dateToString: { format: "%Y-%m-%d", date: "$system_date" } }
          },
          "amount": { "$sum": "$transaction_amount" }
        }
      },
      {
        "$group": {
          "_id": {
            "system_date": "$_id.system_date",
            "transaction_currency_type": "$_id.transaction_currency_type"
          },
          "by_transaction_way": {
            "$push": {
              "transaction_way": "$_id.transaction_way",
              "amount": "$amount"
            }
          },
          "amount": { "$sum": "$amount" }
        }
      }, {
        "$sort": {
          "_id": -1
        }
      }
    ];
    transactionModel.aggregate(aggr, function (err, translist) {
      if (err) {
        res.send(err);
      } else {
        try {
          let final_data = []; let total_credit_value = 0; let total_debit_value = 0;
          let currency = "";
          translist.forEach(x => {
            x.by_transaction_way.forEach(x1 => {
              currency = x1.id.transaction_currency_type;
              if (filter === x1.transaction_way) {
                final_data.push({ _id: x._id.system_date, price: x1.amount, currency: x._id.transaction_currency_type });
              }
              if (x1.transaction_way === "Credit") {
                total_credit_value += x1.amount;
              }
              else if (x1.transaction_way === "Debit") {
                total_debit_value += x1.amount;
              }
            });
          });
          let values = {
            currency: currency,
            total_credit_value: total_credit_value,
            total_debit_value: total_debit_value,
            available_balance: total_credit_value - total_debit_value
          }
          res.json({ Status: "Success", Message: "Income Data", Data: final_data, total_count: values, Code: 200 });
        }
        catch (ex) {
          res.json({ Status: "Failure", Message: ex.message, details: ex, Code: 500 });
        }
      }
    });
  }
  catch (ex) {
    res.json({ Status: "Failure", Message: ex.message, details: ex, Code: 500 });
  }
}

router.post('/movement/report', async function (req, res) {
  movement_transaction_report(req, res);
});

router.post('/transaction/report', async function (req, res) {
  movement_transaction_report(req, res);
});

async function movement_transaction_report(req, res) {
  try {
    let params = { user_id: req.body.user_id }
    if (req.body.transaction_type) {
      params.transaction_type = req.body.transaction_type;
    }
    if (req.body.start_date && req.body.end_date && req.body.start_date !== '' && req.body.end_date !== '') {
      req.body.start_date = new Date(new Date(req.body.start_date).toISOString());
      req.body.end_date = new Date(new Date(req.body.end_date + 'T23:59:59Z').toISOString());
      params.system_date = {
        $gte: req.body.start_date,
        $lte: req.body.end_date
      }
    }
    let aggr = [
      {
        $match: params
      },
      {
        "$group": {
          "_id": {
            "transaction_way": "$transaction_way",
            "transaction_currency": "$transaction_currency",
            "system_date": { $dateToString: { format: "%Y-%m-%d", date: "$system_date" } }
          },
          "amount": { "$sum": "$transaction_amount" }
        }
      },
      {
        "$group": {
          "_id": {
            "system_date": "$_id.system_date",
            "transaction_currency": "$_id.transaction_currency"
          },
          "by_transaction_way": {
            "$push": {
              "transaction_way": "$_id.transaction_way",
              "amount": "$amount"
            }
          },
          "amount": { "$sum": "$amount" }
        }
      }, {
        "$sort": {
          "_id": -1
        }
      }
    ];
    transactionModel.aggregate(aggr, function (err, translist) {
      if (err) {
        res.send(err);
      } else {
        try {
          let currency = "";
          let final_data = []; let total_credit_value = 0; let total_debit_value = 0;
          translist.forEach(x => {
            currency = x._id.transaction_currency;
            final_data.push({ _id: x._id.system_date, price: 0, currency: x._id.transaction_currency, credit_amount: 0, debit_amount: 0 });
            x.by_transaction_way.forEach(x1 => {
              if (x1.transaction_way === "Credit") {
                total_credit_value += x1.amount;
                final_data[final_data.length - 1].credit_amount = x1.amount;
              }
              else if (x1.transaction_way === "Debit") {
                total_debit_value += x1.amount;
                final_data[final_data.length - 1].debit_amount = x1.amount;
              }
            });
          });
          let values = {
            currency: currency,
            total_credit_value: total_credit_value,
            total_debit_value: total_debit_value,
            available_balance: total_credit_value - total_debit_value
          }
          res.json({ Status: "Success", Message: "Income Data", Data: final_data, total_count: values, Code: 200 });
        }
        catch (ex) {
          res.json({ Status: "Failure", Message: ex.message, details: ex, Code: 500 });
        }
      }
    });
  }
  catch (ex) {
    res.json({ Status: "Failure", Message: ex.message, details: ex, Code: 500 });
  }
}

router.post('/dashboard/data', async function (req, res) {
  try {
    let user_details = await userdetailsModel.findOne({ _id: req.body.user_id });
    let numbers = '';
    if (user_details.roll_type == "Child") {
      numbers = user_details.parent_of;
    }
    else if (user_details.roll_type == "Admin") {
      numbers = user_details.parent_code;
    }
    let count_1 = await userdetailsModel.find({ parent_of: numbers }).countDocuments();
    let count_2 = await userdetailsModel.find({ parent_code: numbers }).countDocuments();
    let userCount = {
      child_count: count_1,
      admin_count: count_2,
      total_count: count_1 + count_2
    }

    let params = {
      transaction_date: {
        $gte: new Date(req.body.start_date),
        $lte: new Date(req.body.end_date)
      },
      user_id: req.body.user_id, transaction_way: req.body.transaction_way,
      delete_status: false
    };
    if (req.body.transaction_type && req.body.transaction_type !== '') {
      params.transaction_type = req.body.transaction_type;
    }
    let aggr = [{ $match: params },
    {
      $addFields: {
        "transaction_desc_id": { $toObjectId: "$transaction_desc" },
        "transaction_sub_desc_id": { $toObjectId: "$transaction_sub_desc" }/*,
        "transaction_type_id": { $toObjectId: "$transaction_type" }*/
      }
    },
    {
      $lookup: {
        from: 'desc_types',
        'localField': 'transaction_desc_id',
        'foreignField': '_id',
        'as': 'desc_type'
      }
    },
    {
      $lookup: {
        from: 'sub_desc_types',
        'localField': 'transaction_sub_desc_id',
        'foreignField': '_id',
        'as': 'sub_desc_type'
      }
    },
    {
      $lookup: {
        from: 'payment_types',
        'localField': 'transaction_type_id',
        'foreignField': '_id',
        'as': 'payment_type'
      }
    },
    {
      $unwind: {
        path: "$desc_type",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: "$sub_desc_type",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: "$payment_type",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        "transaction_description": "$desc_type.desc_type",
        "transaction_sub_description": "$sub_desc_type.sub_desc_type",
        "transaction_type": "$payment_type.payment_type",
      }
    },
    {
      $project: {
        transaction_date: 1, transaction_description: 1, transaction_sub_description: 1, transaction_type: 1,
        transaction_way: 1, transaction_amount: 1, transaction_balance: 1, transaction_currency_symbol: 1, createdAt: 1
      }
    },
    { $sort: { _id: -1 } }];
    let transactions = await transactionModel.aggregate(aggr);
    //let transactions = await transactionModel.find(params, {createdAt:0, updatedAt:0, delete_status: 0, __v:0}, { sort: { _id: -1 } });

    let fin_credit = 0;
    let fin_debit = 0;
    transactions.forEach(element => {
      if (element.transaction_way == "Credit") {
        fin_credit = +fin_credit + +element.transaction_amount;
      }
      else if (element.transaction_way == "Debit") {
        fin_debit = +fin_debit + +element.transaction_amount;
      }
    });
    let balance = {
      Credit_amount: fin_credit,
      Debit_amount: fin_debit,
      Balance_amount: fin_credit - fin_debit,
    }
    let notificationCount = await notificationModel.find({ delete_status: false, notify_status: 'Unread' }).countDocuments();
    let user_blocked_msg = "";
    if (user_details.delete_status) {
      user_blocked_msg = "Your account had blocked for more details contact your admin";
    }
    transactions.forEach(x => {
      x.transaction_date = new Date(x.transaction_date).toLocaleDateString("en-CA") + " " + new Date(x.transaction_date).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })
      x.createdAt = moment(x.createdAt).tz(req.body.timezone).format("YYYY-MM DD hh:mm am");
    });
    res.json({ Status: "Success", Message: "Filter dashboard", Data: transactions, balance: balance, user_count: userCount, notification_count: notificationCount, user_blocked: user_blocked_msg, Code: 200 });
  }
  catch (ex) {
    res.json({ Status: "Failed", Message: ex.message });
  }
});

router.post("/budget_transactions_by_category", async function (req, res) {
  try {
    let aggr = [
      { "$match": { "transaction_budget_id": req.body.budget_id, "delete_status": false } },
      { "$addFields": { "transaction_desc_id": { "$toObjectId": "$transaction_desc" } } },
      {
        $lookup: {
          "from": "desc_types",
          "localField": "transaction_desc_id",
          "foreignField": "_id",
          "as": "desc_types"
        }
      },
      {
        $unwind: { path: "$desc_type" }
      },
      {
        $group: {
          "_id": {
            "desc_type": "$desc_types.desc_type",
            "currency": "$transaction_currency_symbol"
          },
          "amount": { $sum: "$transaction_amount" }
        }
      },
      {
        $addFields: { "category": "$_id.desc_type", "currency": "$_id.currency" }
      },
      { $project: { "_id": 0 } }
    ];
    if (req.body.asc) {
      aggr.push({ $sort: { "category": (req.body.asc == true ? 1 : -1) } });
    }
    console.log(JSON.stringify(aggr));
    transactionModel.aggregate(aggr, function (err, transactions) {
      console.log(transactions);
      res.json({ Status: "Success", Data: transactions, Code: 200 });
    });
  }
  catch (ex) {
    res.json({ Status: "Failed", Message: ex.message, Code: 500 });
  }
});



router.post('/accountsummery/data', async function (req, res) {
  let user_details = await userdetailsModel.findOne({ _id: req.body.user_id });
  var total_count = 0;
  var numbers = '';
  if (user_details.roll_type == "Child") {
    numbers = user_details.parent_of;
    var count_1 = await userdetailsModel.find({ parent_of: numbers }).count();
    var count_2 = await userdetailsModel.find({ parent_code: numbers }).count();
    total_count = count_1 + count_2;
  }
  if (user_details.roll_type == "Admin") {
    numbers = user_details.parent_code;
    var count_1 = await userdetailsModel.find({ parent_of: numbers }).count();
    var count_2 = await userdetailsModel.find({ parent_code: numbers }).count();
    total_count = count_1 + count_2;
  }
  let f = {
    child_count: count_1,
    admin_count: count_2,
    total_count: total_count
  }
  let transactions = await transactionModel.aggregate([{ $match: { user_id: req.body.user_id } }, { $sort: { _id: -1 } }]);
  var fin_credit = 0;
  var fin_debit = 0;
  transactions.forEach(element => {
    element.transaction_date = new Date(element.transaction_date).toLocaleDateString("en-CA");
    element.createdAt = moment(element.createdAt).tz(req.body.timezone).format("YYYY-MM DD hh:mm am");
    if (element.transaction_way == "Credit") {
      fin_credit = +fin_credit + +element.transaction_amount;
    }
  });
  transactions.forEach(element => {
    if (element.transaction_way == "Debit") {
      fin_debit = +fin_debit + +element.transaction_amount;
    }
  });
  let balance = {
    Credit_amount: fin_credit,
    Debit_amount: fin_debit,
    Balance_amount: fin_credit - fin_debit,
  }
  res.json({ Status: "Success", Message: "account summery data", Data: transactions, balance: balance, user_count: f, Code: 200 });
});


router.get('/getlist', async function (req, res) {
  let params = { delete_status: false };
  /*if (req.query.userid) {
    let userids = [req.query.userid];
    let useragg = userdetailsModel.aggregate([{ "$match": { "_id": new Mongoose().Types.ObjectId(req.query.userid) } },
    {
      "$lookup": {
        "from": "userdetails",
        "as": "child",
        "let": { "parent_of": "$parent_of" },
        "pipeline": [
          { "$match": { "$eq": ["$$parent_of", "$parent_code"] } },
          { "$project": { "_id": 1 } }
        ]
      }
    },
    { "$project": { "createdAt": 0, "updatedAt": 0, "delete_status": 0 } }
    ]);
    await useragg.exec().then(function (userlist) {
      if (userlist.length > 0) {
        userlist.forEach(x => {
          console.log(x);
          x.child.forEach(x1 => {
            userids.push(x1._id.toString());
          });
        })
      }
    });
    params.user_id = { "$in": userids };
  }*/
  console.log(params);
  transactionModel.find(params, function (err, transactions_list) {
    res.json({ Status: "Success", Message: "transaction Details", Data: transactions_list, Code: 200 });
  });
});



router.get('/getlist_update', function (req, res) {
  transactionModel.find({}, async function (err, Functiondetails) {
    for (let a = 0; a < Functiondetails.length; a++) {
      let dd = {
        transaction_currency_type: "INR"
      }
      transactionModel.findByIdAndUpdate(Functiondetails[a]._id, dd, { new: true }, function (err, UpdatedDetails) {
        if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
        // res.json({Status:"Success",Message:"transaction Updated", Data : UpdatedDetails ,Code:200});
      });
      if (a == Functiondetails.length - 1) {
        res.json({ Status: "Success", Message: "transaction Details", Data: {}, Code: 200 });
      }
    }
  });
});



router.post('/edit', function (req, res) {
  transactionModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "transaction Updated", Data: UpdatedDetails, Code: 200 });
  });
});
// // DELETES A USER FROM THE DATABASE
router.post('/delete', function (req, res) {
  transactionModel.findByIdAndRemove(req.body._id, function (err, user) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "transaction Deleted successfully", Data: {}, Code: 200 });
  });
});


////Mani/////



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
  matchQuery = { $and: [{ createdAt: { $gte: startDate.toISOString() } }, { createdAt: { $lte: endDate.toISOString() } }] };

  transactionModel.aggregate(
    [
      {
        $match: matchQuery

      },
    ],
    function (err, data) {
      if (err) {
        return commonUtil.makeErrorResponse(res, err, "", "");
      } else {
        res.json({ Status: "Success", Message: "Payment Type Filter Datas List", Data: data, Code: 200 });
      }
    }
  );
});

function paytm_credentials() {
  return {
    "mid": "THINKI09196151683246",
    "mkey": "LsE@@ejAZ&Z#r3#m",
    //"Website (For web)" : "WEBSTAGING",
    "website": "APPSTAGING",
    //"Channel id: (For web)" : "WEB",
    "channelid": "WAP",
    "industryid": "Retail"
  }
}

router.get("/paytm_credentials", function (req, res) {
  res.send(paytm_credentials());
})

router.post("/payment_initiate", async function (req, res) {
  try {
    let subscription = await subscriptionModel.findOne({ _id: req.body.subscriptionid });
    console.log(subscription);
    if (subscription !== null) {
      const https = require('https');
      const PaytmChecksum = require('paytmchecksum');
      const { v4: uuidv4 } = require('uuid');
      let credentials = paytm_credentials();
      let orderid = uuidv4();
      let callbackurl = "https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=" + orderid;
      var paytmParams = {};
      paytmParams.body = {
        "requestType": "Payment",
        "mid": credentials.mid,
        "websiteName": credentials.website,
        "orderId": orderid,
        "callbackUrl": callbackurl,
        "txnAmount": {
          "value": parseFloat(subscription.amount).toFixed(2).toString(),
          "currency": "INR",
        },
        "userInfo": {
          "custId": req.body.userid,
        },
      };

      console.log(paytmParams.body);

      /*
      * Generate checksum by parameters we have in body
      * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
      */
      PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), credentials.mkey).then(function (checksum) {

        paytmParams.head = {
          "signature": checksum
        };

        var post_data = JSON.stringify(paytmParams);

        var options = {

          /* for Staging */
          hostname: 'securegw-stage.paytm.in',

          /* for Production */
          // hostname: 'securegw.paytm.in',

          port: 443,
          path: '/theia/api/v1/initiateTransaction?mid=' + credentials.mid + '&orderId=' + orderid,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': post_data.length
          }
        };

        var response = "";
        var post_req = https.request(options, function (post_res) {
          post_res.on('data', function (chunk) {
            response += chunk;
          });

          post_res.on('end', function () {
            console.log(response);
            //console.log(typeof response);
            response = JSON.parse(response);
            let result = {
              mid: credentials.mid,
              orderid: orderid,
              txnToken: response.body.txnToken,
              amount: parseFloat(subscription.amount).toFixed(2).toString(),
              callbackurl: callbackurl,
              environment: "staging"
            }
            res.send({ "Status": response.body.resultInfo.resultMsg, Data: result, Code: 200 });
          });
        });

        post_req.write(post_data);
      });
    }
    else {
      res.send({ "Status": "Failed", Message: "Wrong Subscriptionid", Code: 400 });
    }
  }
  catch (ex) {
    res.send({ "Status": "Failed", Message: ex.message, Code: 500 });
  }
});

module.exports = router;
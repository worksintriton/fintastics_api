var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var budgetModel = require('./../models/budgetModel');


router.post('/create', async function (req, res) {
  try {
    await budgetModel.create({
      budget_title: req.body.budget_title,
      budget_type: req.body.budget_type,
      budget_period_type: req.body.budget_period_type,
      budget_amount: req.body.budget_amount,
      budget_currency: req.body.budget_currency,
      budget_cat: req.body.budget_cat,
      budget_account: req.body.budget_account,
      budget_start_date: req.body.budget_start_date,
      budget_end_date: req.body.budget_end_date,
      budget_value: req.body.budget_value,
      budget_head_type: req.body.budget_head_type,
      budget_notification: req.body.budget_notification,
      delete_status: false
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
      params.budget_end_date = { $gte: new Date().toISOString() }
    }
    else if (req.query.status === 'Closed') {
      params.budget_end_date = { $lte: new Date().toISOString() }
    }
  }
  if (req.query.period_type) {
    params.budget_period_type = req.query.period_type;
  }
  budgetModel.find(params, {}, { skip: skip, limit: limit }, function (err, budget_list) {
    res.json({ Status: "Success", Message: "Budget Details", Data: budget_list, Code: 200 });
  });
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




module.exports = router;

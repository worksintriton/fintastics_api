var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var payment_typeModel = require('./../models/payment_typeModel');
var desc_typeModel = require('./../models/desc_typeModel');
var currencyModel = require('./../models/currencyModel');
const budgetModel = require('../models/budgetModel');

router.post('/create', async function (req, res) {
  try {
    await payment_typeModel.create({
      payment_type: req.body.payment_type,
      date_and_time: req.body.date_and_time,
      delete_status: false
    },
      function (err, user) {
        console.log(user)
        res.json({ Status: "Success", Message: "Added successfully", Data: user, Code: 200 });
      });
  }
  catch (e) {
    res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
  }
});


router.get('/deletes', function (req, res) {
  payment_typeModel.remove({}, function (err, user) {
    if (err) return res.status(500).send("There was a problem deleting the user.");
    res.json({ Status: "Success", Message: "payment type Deleted", Data: {}, Code: 200 });
  });
});


router.post('/getlist_id', function (req, res) {
  payment_typeModel.find({ Person_id: req.body.Person_id, delete_status: false }, function (err, StateList) {
    res.json({ Status: "Success", Message: "payment type List", Data: StateList, Code: 200 });
  });
});

router.get('/getlist', async function (req, res) {
  let desc_type_list = await desc_typeModel.find({ delete_status: false }).select({ _id: 1, desc_type: 1 });
  let currency_list = await currencyModel.find({ delete_status: false }).select({_id: 1, currency: 1, symbol: 1});
  payment_typeModel.find({ delete_status: false }, function (err, payment_type_list) {
    res.json({ Status: "Success", Message: "payment type Details", Data: { "payment_types": payment_type_list, "desc_types": desc_type_list, "currencies": currency_list }, Code: 200 });
  }).select({ _id: 1, payment_type: 1 });
});

router.post('/getlist_of_budget', function (req, res) {
  if (req.body.budget_id && req.body.budget_id != "") {
    budgetModel.find({ _id: req.body.budget_id, delete_status:false }, function (err, budget_list) {
      if (err) {
        res.json({ Status: "Failed", Message: err.message, Code: 400 });
      }
      let payment_type = [];
      budget_list.forEach(x => {
        x.budget_account.forEach(acc => {
          payment_type.push({ _id: acc.id, payment_type: acc.name });
        });
      })
      res.json({ Status: "Success", Message: "payment type Details", Data: payment_type, Code: 200 });
    });
  }
  else {
    payment_typeModel.find({}, { payment_type: 1 }, {}, function (err, payment_type_list) {
      if (err) {
        res.json({ Status: "Failed", Message: err.message, Code: 400 });
      }
      res.json({ Status: "Success", Message: "payment type Details", Data: payment_type_list, Code: 200 });
    });
  }
});


router.post('/edit', function (req, res) {
  payment_typeModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "payment type Updated", Data: UpdatedDetails, Code: 200 });
  });
});
// // DELETES A USER FROM THE DATABASE
router.post('/delete', function (req, res) {
  payment_typeModel.findByIdAndRemove(req.body._id, function (err, user) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "payment type Deleted successfully", Data: {}, Code: 200 });
  });
});




/////Mani////




router.post('/getFilterDatas', async function (req, res) {
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

  payment_typeModel.aggregate(
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





module.exports = router;

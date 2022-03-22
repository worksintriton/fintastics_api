var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var desc_typeModel = require('./../models/desc_typeModel');
var sub_desc_typeModel = require('./../models/sub_desc_typeModel');
const budgetModel = require('../models/budgetModel');

router.post('/create', async function (req, res) {
  try {
    await desc_typeModel.create({
      desc_type: req.body.desc_type,
      date_and_time: req.body.date_and_time,
      delete_status: false,
      icon: req.body.icon
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
  desc_typeModel.remove({}, function (err, user) {
    if (err) return res.status(500).send("There was a problem deleting the user.");
    res.json({ Status: "Success", Message: "desc type Deleted", Data: {}, Code: 200 });
  });
});


router.post('/getlist_id', function (req, res) {
  desc_typeModel.find({ Person_id: req.body.Person_id, delete_status: false }, function (err, desc_type) {
    res.json({ Status: "Success", Message: "desc type List", Data: desc_type, Code: 200 });
  });
});


router.get('/getlist_cat_budget', async function (req, res) {
  const desc_details = await desc_typeModel.find({});
  const sub_desc_type_detail = await sub_desc_typeModel.find({});
  desc_list = [];
  final_desc = [];
  desc_details.forEach(element => {
    console.log(element);
    let aa = {
      _id: element._id,
      desc_name: element.desc_type,
      selected: false,
      sub_desc: []
    }
    desc_list.push(aa);
  });
  for (let a = 0; a < desc_list.length; a++) {
    for (let b = 0; b < sub_desc_type_detail.length; b++) {
      if (desc_list[a]._id == sub_desc_type_detail[b].desc_type_id) {
        let cc = {
          desc_id: desc_list[a]._id,
          desc_name: desc_list[a].desc_type,
          sub_desc_id: sub_desc_type_detail[b]._id,
          sub_desc_name: sub_desc_type_detail[b].sub_desc_type,
          selected: false
        }
        desc_list[a].sub_desc.push(cc);
      }
    }
    if (a == desc_list.length - 1) {
      res.json({ Status: "Success", Message: "desc type", Data: desc_list, Code: 200 });
    }
  }
});



router.get('/getlist', function (req, res) {
  desc_typeModel.aggregate([
    { $match: { delete_status: false } },
    { $addFields: { desctypeId: { "$toString": "$_id" } } },
    {
      $lookup: {
        from: 'sub_desc_types',
        localField: 'desctypeId',
        foreignField: 'desc_type_id',
        as: 'sub_desc_types',
      }
    },
    {
      $project: {
        _id: 1,
        desc_type: 1,
        "sub_desc_types._id": 1,
        "sub_desc_types._sub_desc_type": 1
      }
    }], function (err, desc_type_list) {
      res.json({ Status: "Success", Message: "desc type Details", Data: desc_type_list, Code: 200 });
    });
});

router.post('/getlist_of_budget', function (req, res) {
  let params = { delete_status: false };
  if (req.body.budget_id && req.body.budget_id != "") {
    budgetModel.find({ _id: req.body.budget_id }, function (err, desc_type_list) {
      if (err) {
        res.json({ Status: "Failed", Message: err.message, Code: 400 });
      }
      let desc_type = [];
      desc_type_list.forEach(x => {
        x.budget_cat.forEach(cat => {
          desc_type.push({ _id: cat.id, desc_type: cat.name });
        });
      })
      res.json({ Status: "Success", Message: "desc type Details", Data: desc_type, Code: 200 });
    });
  }
  else {
    desc_typeModel.find({}, { desc_type: 1 }, {}, function (err, desc_type_list) {
      if (err) {
        res.json({ Status: "Failed", Message: err.message, Code: 400 });
      }
      res.json({ Status: "Success", Message: "desc type Details", Data: desc_type_list, Code: 200 });
    });
  }
});


router.post('/edit', function (req, res) {
  desc_typeModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "desc type Updated", Data: UpdatedDetails, Code: 200 });
  });
});
// // DELETES A USER FROM THE DATABASE
router.post('/delete', function (req, res) {
  desc_typeModel.findByIdAndRemove(req.body._id, function (err, user) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "desc type Deleted successfully", Data: {}, Code: 200 });
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

  desc_typeModel.aggregate(
    [
      {
        $match: matchQuery

      },
    ],
    function (err, data) {
      if (err) {
        return commonUtil.makeErrorResponse(res, err, "", "");
      } else {
        res.json({ Status: "Success", Message: "desc type Filter Datas List", Data: data, Code: 200 });
      }
    }
  );
});




module.exports = router;

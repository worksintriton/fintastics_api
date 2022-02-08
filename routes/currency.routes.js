var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var currencyModel = require('./../models/currencyModel');

router.post('/create', async function (req, res) {
  try {
    await currencyModel.create({
      currency: req.body.currency,
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
  currencyModel.remove({}, function (err, user) {
    if (err) return res.status(500).send("There was a problem deleting the user.");
    res.json({ Status: "Success", Message: "Currency Deleted", Data: {}, Code: 200 });
  });
});


router.post('/getlist_id', function (req, res) {
  currencyModel.find({ Person_id: req.body.Person_id, delete_status: false }, function (err, StateList) {
    res.json({ Status: "Success", Message: "Currency List", Data: StateList, Code: 200 });
  });
});



router.get('/getlist', function (req, res) {
  currencyModel.find({ delete_status: false }, function (err, Functiondetails) {
    res.json({ Status: "Success", Message: "Currency Details", Data: Functiondetails.map(x => { return {id:x.id, currency:x.currency } }), Code: 200 });
  });
});


router.post('/edit', function (req, res) {
  currencyModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Currency Updated", Data: UpdatedDetails, Code: 200 });
  });
});
// // DELETES A USER FROM THE DATABASE
router.post('/delete', function (req, res) {
  currencyModel.findByIdAndRemove(req.body._id, function (err, user) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Currency Deleted successfully", Data: {}, Code: 200 });
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

  currencyModel.aggregate(
    [
      {
        $match: matchQuery

      },
    ],
    function (err, data) {
      if (err) {
        return commonUtil.makeErrorResponse(res, err, "", "");
      } else {
        res.json({ Status: "Success", Message: "Currency Filter Datas List", Data: data, Code: 200 });
      }
    }
  );
});





module.exports = router;

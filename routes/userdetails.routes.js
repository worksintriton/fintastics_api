var express = require('express');
var router = express.Router();
const requestss = require("request");
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var GeoPoint = require('geopoint');

var userdetailsModel = require('./../models/userdetailsModel');
let subscriptionModel = require('./../models/subscriptionModel');
let userSubscriptionModel = require('./../models/userSubscriptionModel');

router.post('/create', async function (req, res) {
  try {
    let randomChars = '0123456789';
    let result = '', roll_type = '', currency = req.body.currency, currency_symbol = req.body.currency_symbol;
    for (var i = 0; i < 6; i++) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    if (req.body.parent_of !== "") {
      result = ''
    }
    if (req.body.account_type == "Family" && req.body.parent_of == "") {
      roll_type = 'Admin'
    }
    if (req.body.account_type == "Family" && req.body.parent_of !== "") {
      roll_type = 'Child'
      parent = await userdetailsModel.findOne({ "parent_code": req.body.parent_of });
      if (parent !== "") {
        currency = parent.currency;
        currency_symbol = parent.currency_symbol;
      }
    }
    await userdetailsModel.create({
      username: req.body.username || "",
      password: req.body.password || "",
      user_email: req.body.user_email || "",
      first_name: req.body.first_name || "",
      last_name: req.body.last_name || "",
      dob: req.body.dob || "",
      contact_number: req.body.contact_number || "",
      fb_token: req.body.fb_token || "",
      mobile_type: req.body.mobile_type || "",
      delete_status: req.body.delete_status || "",
      account_type: req.body.account_type || "",
      roll_type: roll_type || "",
      parent_code: result,
      parent_of: req.body.parent_of || "",
      profile_img: req.body.profile_img || "",
      currency: currency,
      currency_symbol: currency_symbol,
      delete_status: false
    },
      async function (err, user) {
        if (err) {
          res.json({ Status: "Failed", Message: err.message, Code: 400 });
        }

        if (roll_type === 'Admin' || req.body.account_type === 'Personal') {
          let free_subscription_id = "62208a171f3643036a603c13";
          let list = await subscriptionModel.find({ _id: free_subscription_id }, { months: 1, amount: 1 });
          if (list.length > 0) {
            let enddate = new Date(new Date().setMonth(new Date().getMonth() + list[0].months));
            await userSubscriptionModel.create({
              userid: user._id,
              subscriptionid: free_subscription_id,
              startdate: new Date(),
              enddate: enddate,
              amount: list[0].amount,
              expired: false,
              delete_status: false
            },
              function (err, subscription) {
                if (err) {
                  res.json({ "Status": "Failure", Message: err.message, Code: 500 });
                } else {
                  res.json({ Status: "Success", Message: "Sign up successfully! welcome to Fintastics", Data: user, Code: 200 });
                }
              });
          }
          else {
            res.json({ "Status": "Failure", Message: "Wrong Subscription Id", Code: 500 });
          }
        }
        else {
          res.json({ Status: "Success", Message: "Sign up successfully! welcome to Fintastics", Data: user, Code: 200 });
        }
      });
  }
  catch (e) {
    res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
  }
});

router.post('/authenticate', async function (req, res) {
  var user_email = req.body.email;
  var password = req.body.password;
  console.log("user_email ", user_email, "password", password)
  const userData = await userdetailsModel.findOne({ user_email: user_email, password: password, roll_type: "SuperAdmin" });
  console.log("userData", userData)
  if (userData) {
    res.json({ Status: "Success", Message: "Successfully loggin", Data: userData, Code: 200 });
    console.log("userData ", userData);
  } else {
    res.json({ Status: "Failed", Message: "user_email or password incorrect", Data: { Message: "user_email or password incorrect" }, Code: 500 });
  }

});

router.post('/check_parent_code', async function (req, res) {
  let phone = await userdetailsModel.findOne({ parent_code: req.body.parent_code });
  if (phone == null) {
    res.json({ Status: "Failed", Message: "Parent Code not found", Data: {}, Code: 404 });
  } else {
    res.json({ Status: "Success", Message: "Valid Parent Code", Data: {}, Code: 200 });
  }
});

router.post('/year_list', async function (req, res) {
  console.log(req.body.current_year);
  var year_value = req.body.current_year;
  var year = []
  for (let a = 0; a < 50; a++) {
    year.push(year_value - a);
    console.log(year_value);
    if (a == 50 - 1) {
      res.json({ Status: "Success", Message: "Yearly", Data: year, Code: 200 });
    }
  }
});

router.delete('/delete/:id', function (req, res) {
  console.log(req.params.id);
  userdetailsModel.findByIdAndRemove(req.params.id, function (err, user) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Userdetail Deleted Successfully", Data: {}, Code: 200 });
  });
});


router.put('/update/:id', function (req, res) {
  userdetailsModel.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    console.log(err);
    res.json({ Status: "Success", Message: "Userdetail Detail Updated", Data: UpdatedDetails, Code: 200 });
  });
});

router.post('/send/emailotp', async function (req, res) {
  let email_detail = await userdetailsModel.findOne({ user_email: req.body.user_email });
  if (email_detail == null) {
    var randomChars = '0123456789';
    var result = '';
    for (var i = 0; i < 6; i++) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    console.log(result);
    let random = result;
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: {
        user: 'thinkinghatstech@gmail.com',
        pass: 'Pass@2021'
      }
    });

    var mailOptions = {
      from: 'thinkinghatstech@gmail.com',
      to: req.body.user_email,
      subject: "Email verification OTP",
      text: "Hi, Your OTP is " + random + ". Petfolio OTP for Signup."
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        res.json({ Status: "Failed", Message: error.response, Data: {}, Code: 404 });
      } else {
        res.json({
          Status: "Success", Message: "OTP Sent To Your Eamil Id", Data: {
            'email_id': req.body.user_email,
            'otp': random
          }, Code: 200
        });
      }
    });
  }
  else {
    res.json({ Status: "Failed", Message: "This email id already exist", Data: {}, Code: 404 });
  }
});

router.post('/forgotpassword', async function (req, res) {
  let phone = await userdetailsModel.findOne({ user_email: req.body.user_email });
  if (phone == null) {
    res.json({ Status: "Failed", Message: "Invalid Eamil id", Data: {}, Code: 404 });
  } else {
    result = phone.password;
    console.log(result);
    let random = result;
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: {
        user: 'carpeinfinitus@gmail.com',
        pass: 'Petfolio!@#$%3'
      }
    });

    var mailOptions = {
      from: 'carpeinfinitus@gmail.com',
      to: req.body.user_email,
      subject: "Forgot password",
      text: "Hi, This is your password " + random + "."
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        res.json({ Status: "Success", Message: "Eamil id sent successfully", Data: {}, Code: 200 });
      }
    });
  }
});

router.get('/deletes', function (req, res) {
  userdetailsModel.remove({}, function (err, user) {
    if (err) return res.status(500).send("There was a problem deleting the user.");
    res.json({ Status: "Success", Message: "User Details Deleted", Data: {}, Code: 200 });
  });
});

router.post('/filter_date', function (req, res) {
  userdetailsModel.find({}, function (err, StateList) {
    var final_Date = [];
    for (let a = 0; a < StateList.length; a++) {
      var fromdate = new Date(req.body.fromdate);
      var todate = new Date(req.body.todate);
      var checkdate = new Date(StateList[a].createdAt);

      if (checkdate >= fromdate && checkdate <= todate) {
        final_Date.push(StateList[a]);
      }
      if (a == StateList.length - 1) {
        res.json({ Status: "Success", Message: "Demo screen  List", Data: final_Date, Code: 200 });
      }
    }
  });
});

router.post('/mobile/login', async function (req, res) {
  let userdetails = await userdetailsModel.aggregate([{ $match: { "user_email": req.body.user_email, "password": req.body.password } }, { $project: { updatedAt: 0, createdAt: 0, __v: 0, password: 0 } }, { $addFields: { subscriptions: [] } }]);
  if (userdetails == null) {
    res.json({ Status: "Failed", Message: "Unable to Sign In, User account not found", Data: {}, Code: 404 });
  } else if (userdetails.length === 0) {
    res.json({ Status: "Failed", Message: "No records found for the provided criteria", Data: {}, Code: 400 });
  } else {
    userdetails = userdetails[0];
    let sublist = await userSubscriptionModel.find({ userid: userdetails._id, expired: false }).sort({ enddate: 1 });
    if (sublist.length > 0) {
      let list = await subscriptionModel.find({ _id: sublist[0].subscriptionid });
      if (list.length > 0) {
        userdetails.subscriptions.push({ _id: list[0]._id, title: list[0].title, type: list[0].type, startdate: sublist[0].startdate, enddate: sublist[0].enddate, months: sublist[0].months, amount: sublist[0].amount });
      }
    }
    res.json({ Status: "Success", Message: "Logged in successfully", Data: userdetails, Code: 200 });
  }
});

router.post('/user_subscriptions', async function (req, res) {
  let subscriptions = [];
  let sublist = await userSubscriptionModel.find({ userid: req.body.userid, expired: false });
  for (let i = 0; i < sublist.length; i++) {
    let list = await subscriptionModel.find({ _id: sublist[i].subscriptionid });
    if (list.length > 0) {
      subscriptions.push({ _id: list[0]._id, title: list[0].title, type: list[0].type, startdate: sublist[i].startdate, enddate: sublist[i].enddate, months: sublist[0].months, amount: sublist[0].amount });
    }
  }
  res.json({ Status: "Success", Message: "User Subscription List", Data: subscriptions, Code: 200 });
});

router.post('/getlist_id', async function (req, res) {
  try {
    await userdetailsModel.aggregate([{ $match: { _id: require('mongoose').Types.ObjectId(req.body._id) } }, { $project: { createdAt: 0, updatedAt: 0, delete_status: 0, __v: 0 } }, { $addFields: { subscriptions: [] } }]).exec(async function (err, userlist) {
      if (err) {
        res.json({ Status: "Failed", Message: err.message, Code: 400 });
      } else {
        try {
          if (userlist.length > 0) {
            let sublist = await userSubscriptionModel.find({ userid: userlist[0]._id, expired: false }).sort({ enddate: 1 });
            if (sublist.length > 0) {
              let list = await subscriptionModel.find({ _id: sublist[0].subscriptionid });
              if (list.length > 0) {
                userlist[0].subscriptions.push({ _id: list[0]._id, title: list[0].title, type: list[0].type, startdate: sublist[0].startdate, enddate: sublist[0].enddate, months: sublist[0].months, amount: sublist[0].amount });
              }
            }
            res.json({ Status: "Success", Message: "User Details List", Data: userlist[0], Code: 200 });
          }
          else {
            res.json({ Status: "Failed", Message: "No user details for the provided _id", Code: 400 });
          }
        }
        catch (ex) {
          res.json({ Status: "Failed", Message: ex.message, Code: 400 });
        }
      }
    });
  }
  catch (ex) {
    console.log(ex);
    res.json({ Status: "Failed", Message: ex.message, Code: 400 });
  }
});

router.post('/fetch_child', function (req, res) {
  userdetailsModel.find({ parent_of: req.body.parent_of }, function (err, StateList) {
    res.json({ Status: "Success", Message: "Child Detail List", Data: StateList, Code: 200 });
  });
});

router.get('/getlist', function (req, res) {
  userdetailsModel.find({}, function (err, Functiondetails) {
    res.json({ Status: "Success", Message: "User Details Details", Data: Functiondetails, Code: 200 });
  });
});

router.post('/mobile/update/fb_token', function (req, res) {
  userdetailsModel.findByIdAndUpdate(req.body.user_id, req.body, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "FB Updated", Data: UpdatedDetails, Code: 200 });
  });
});




router.post('/block_unblock_user', function (req, res) {
  console.log(req.body);
  userdetailsModel.findByIdAndUpdate(req.body.user_id, req.body, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    console.log(err);
    res.json({ Status: "Success", Message: "Status Updated", Data: UpdatedDetails, Code: 200 });
    console.log(req.body);
  });
});




router.post('/mobile/update/profile', function (req, res) {
  userdetailsModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Profile Updated", Data: UpdatedDetails, Code: 200 });
  });
});




router.post('/update_token', function (req, res) {
  userdetailsModel.find({}, async function (err, StateList) {
    for (let a = 0; a < StateList.length; a++) {
      userdetailsModel.findByIdAndUpdate(StateList[a]._id, { fb_token: "" }, { new: true }, function (err, UpdatedDetails) {
        if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
        // res.json({Status:"Success",Message:"FB Updated", Data : UpdatedDetails ,Code:200});
      });
      if (a == StateList.length - 1) {
        res.json({ Status: "Success", Message: "User Details List", Data: StateList, Code: 200 });
      }
    }
  });
});



// // DELETES A USER FROM THE DATABASE
router.post('/delete_by_phone', async function (req, res) {
  let phone = await userdetailsModel.findOne({ user_phone: req.body.user_phone });
  if (phone == null) {
    res.json({ Status: "Failed", Message: "Already User Details Deleted successfully", Data: {}, Code: 200 });
  } else {
    userdetailsModel.findByIdAndRemove(phone._id, function (err, user) {
      if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
      res.json({ Status: "Success", Message: phone.user_phone + " User Details Deleted successfully", Data: {}, Code: 200 });
    });
  }

});


router.post('/logout', async function (req, res) {
  userdetailsModel.findByIdAndUpdate(req.body.user_id, { fb_token: "" }, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "FB Remove", Data: {}, Code: 200 });
  });
});




// // DELETES A USER FROM THE DATABASE
router.post('/admin_delete', function (req, res) {
  userdetailsModel.findByIdAndRemove(req.body._id, function (err, user) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "User Details Deleted successfully", Data: {}, Code: 200 });
  });
});



//////Mani code//////


router.post('/getChildFilterDatas', function (req, res) {
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
  matchQuery['parent_of'] = req.body.parent_of;
  userdetailsModel.aggregate(
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

  userdetailsModel.aggregate(
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


router.post("/test_push_notification", function (req, res) {
  let params = {
    user_id: "",
    fb_token: req.body.fb_token,
    notify_title: 'Test Notification',
    notify_descri: 'Test Notification success',
    notify_img: 'images/notification/transaction-added.png',
    notify_time: '',
    notify_status: 'Unread',
    notify_color: '#322274',
    date_and_time: new Date().toISOString(),
    delete_status: false
  };
  request.post(
    'http://35.88.62.26:3000/api/notification/send_notifiation',
    { json: params },
    function (error, response, body) {
      res.json(response);
      if (!error && response.statusCode == 200) {
      }
    }
  );
});


///test

module.exports = router;

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var request = require("request");
var responseMiddleware = require('./middlewares/response.middleware');
const transactionModel = require('./models/transactionModel');
/*Routing*/

var Activity = require('./routes/Activity.routes');

var userdetails = require('./routes/userdetails.routes');

var notification = require('./routes/notification.routes');

var dashboard_details = require("./routes/dashboard_details");

var payment_type = require('./routes/payment_type.routes');

var transaction = require('./routes/transaction.routes');


var desc_type = require('./routes/desc_type.routes');

var sub_desc_type = require('./routes/sub_desc_type.routes');

var budget = require('./routes/budget.routes');

var currency = require('./routes/currency.routes');

var subscription = require('./routes/subscription.routes');

var userSubscription = require('./routes/userSubscription.routes');

/*Database connectivity*/

BaseUrl = "http://35.88.62.26:3000/api";
const mongoose = require('mongoose');
const budgetModel = require('./models/budgetModel');
mongoose.connect('mongodb://localhost:27017/fintastics');
var db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function (callback) {
  console.log("connection succeeded");
})

var app = express();

app.use(fileUpload());
app.use(responseMiddleware());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view engine', 'pug');

/*Response settings*/



app.use((req, res, next) => {

  res.header('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');
  next();
});




app.post('/upload', function (req, res) {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    res.error(300, 'No files were uploaded.');
    return;
  }

  console.log('req.files >>>', req.files); // eslint-disable-line

  sampleFile = req.files.sampleFile;
  var exten = sampleFile.name.split('.');
  console.log(exten[exten.length - 1]);
  var filetype = exten[exten.length - 1];



  uploadPath = __dirname + '/public/uploads/' + new Date().getTime() + "." + filetype;

  var Finalpath = '/uploads/' + new Date().getTime() + "." + filetype;
  console.log("uploaded path", uploadPath)


  sampleFile.mv(uploadPath, function (err) {
    if (err) {
      console.log(err)
      return res.error(500, "Internal server error");
    }
    res.json({ Status: "Success", Message: "file upload success", Data: Finalpath, BaseUrl: BaseUrl, Code: 200 });
  });
});



app.post('/upload1', function (req, res) {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    res.error(300, 'No files were uploaded.');
    return;
  }

  console.log('req.files >>>', req.files); // eslint-disable-line

  sampleFile = req.files.sampleFile;

  uploadPath = __dirname + '/public/uploads/' + sampleFile.name;

  var Finalpath = '/uploads/' + sampleFile.name;
  console.log("uploaded path", uploadPath)


  sampleFile.mv(uploadPath, function (err) {
    if (err) {
      console.log(err)
      return res.error(500, "Internal server error");
    }
    res.json({ Status: "Success", Message: "file upload success", Data: Finalpath, BaseUrl: global.BaseUrl, Code: 200 });
  });
});



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api/', express.static(path.join(__dirname, 'public')));
app.use('/api/', express.static(path.join(__dirname, 'routes')));

app.use('/api/activity', Activity);

app.use('/api/userdetails', userdetails);

app.use('/api/notification', notification);

app.use('/api/dashboard_details', dashboard_details);

app.use('/api/payment_type', payment_type);


app.use('/api/transaction', transaction);

app.use('/api/desc_type', desc_type);

app.use('/api/sub_desc_type', sub_desc_type);

app.use('/api/budget', budget);

app.use('/api/currency', currency);

app.use('/api/subscription', subscription);

app.use('/api/usersubscription', userSubscription);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log(err.message);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

global.push_notification = async function (params) {
  request.post(
    BaseUrl + '/notification/send_notification',
    { json: params },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
      }
    }
  );
}

setInterval(function () {
  budgetModel.find({ budget_status: "Active", delete_status: false, budget_end_date: { $lte: new Date() } }, async function (err, budgets) {
   await budgets.forEach(async budget => {
      await transactionModel.aggregate([
        {
          $match: { transaction_budget_id: budget._id.toString(), transaction_way: "Debit" }
        },
        {
          $group: {
            _id: "$transaction_budget_id",
            total: { $sum: "$transaction_amount" }
          }
        }
      ], async function (err, transactions) {
        if(err) console.log(err);
        if (transactions.length > 0) {
          if (transactions[0].total <= budget.budget_amount) {
            console.log("calling push notification");
            global.push_notification({
              user_id: budget.budget_userid,
              notify_title: "Budget Achieved",
              notify_descri: "Congratulations on achieving your " + (budget.budget_period_type === "Custom" ? "Onetime" : budget.budget_period_type) + " " + budget.budget_title + " budget target. ",
              notify_img: "#4ECB71",
              notify_color: '/images/notification/budget-achieved.png'
            });
            await budgetModel.findByIdAndUpdate(budget._id, { budget_status: "Expired" });
          }
          else{
            await budgetModel.findByIdAndUpdate(budget._id, { budget_status: "Exceeded and Expired" });
          }
        }
        else{
          await budgetModel.findByIdAndUpdate(budget._id, { budget_status: "Expired" });
        }
      });
    });
  });
}, 5 * 60 * 1000); // every 5 minutes to change budget status as inactive if budget_end_date expired
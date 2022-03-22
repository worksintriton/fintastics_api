var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');	
var fileUpload = require('express-fileupload');
var pdf = require('html-pdf');
const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
var fs = require('fs');
var pug = require ('pug');
var request = require("request");
var userdetailsModel = require('./models/userdetailsModel');
var responseMiddleware = require('./middlewares/response.middleware');

/*Routing*/

var Activity = require('./routes/Activity.routes');

var userdetails = require('./routes/userdetails.routes');

var notification = require('./routes/notification.routes');

var dashboard_details= require("./routes/dashboard_details");

var payment_type = require('./routes/payment_type.routes');

var transaction = require('./routes/transaction.routes');


var desc_type = require('./routes/desc_type.routes');

var sub_desc_type = require('./routes/sub_desc_type.routes');

var budget = require('./routes/budget.routes');

var currency = require('./routes/currency.routes');

var subscription = require('./routes/subscription.routes');

var userSubscription = require('./routes/userSubscription.routes');

/*Database connectivity*/

var BaseUrl = "http://35.88.62.26:3000/api"; 
const mongoose = require('mongoose'); 
mongoose.connect('mongodb://localhost:27017/fintastics'); 
var db = mongoose.connection; 
db.on('error', console.log.bind(console, "connection error")); 
db.once('open', function(callback){ 
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




app.post('/upload', function(req, res) {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    res.error(300,'No files were uploaded.');
    return;
  }

  console.log('req.files >>>', req.files); // eslint-disable-line

  sampleFile = req.files.sampleFile;
  var exten = sampleFile.name.split('.');
  console.log(exten[exten.length - 1]);
  var filetype = exten[exten.length - 1];



  uploadPath = __dirname + '/public/uploads/'  + new Date().getTime() + "." + filetype;

  var Finalpath = '/uploads/'+ new Date().getTime() + "." + filetype;
   console.log("uploaded path",uploadPath )


  sampleFile.mv(uploadPath, function(err) {
    if (err) {
   console.log(err)
   return res.error(500, "Internal server error");
    }
   res.json({Status:"Success",Message:"file upload success", Data :Finalpath, BaseUrl : BaseUrl, Code:200});
  });
});



app.post('/upload1', function(req, res) {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    res.error(300,'No files were uploaded.');
    return;
  }

  console.log('req.files >>>', req.files); // eslint-disable-line

  sampleFile = req.files.sampleFile;

  uploadPath = __dirname + '/public/uploads/' + sampleFile.name;

  var Finalpath = '/uploads/'+ sampleFile.name;
   console.log("uploaded path",uploadPath )


  sampleFile.mv(uploadPath, function(err) {
    if (err) {
   console.log(err)
   return res.error(500, "Internal server error");
    }
   res.json({Status:"Success",Message:"file upload success", Data :Finalpath, BaseUrl : BaseUrl,Code:200});
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
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log(err.message);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var notificationModel = require('./../models/notificationModel');
var userdetailsModel = require('./../models/userdetailsModel');

function notification_create_json(user_id, title, descri, img, color){
  return {
    user_id: user_id,
    notify_title: title,
    notify_descri: descri,
    notify_img: img,
    notify_time: "",
    notify_color: color,
    notify_status: "Unread",
    date_and_time: new Date(),
    delete_status: false
  };
}

router.post('/create', async function (req, res) {
  try {
    await notificationModel.create({
      user_id: req.body.user_id,
      notify_title: req.body.notify_title,
      notify_descri: req.body.notify_descri,
      notify_img: req.body.notify_img,
      notify_time: "",
      notify_color: req.body.notify_color,
      notify_status : "Unread",
      date_and_time: req.body.date_and_time,
      delete_status: false
    },
      function (err, user) {
        console.log(user)
        res.json({ Status: "Success", Message: "Notification Added successfully", Data: user, Code: 200 });
      });
  }
  catch (e) {
    res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
  }
});

router.post('/read', async function (req, res) {
  try {
    let json = {};
    if (req.body._id) {
      json._id = req.body._id
    }
    json.user_id = req.body.user_id;
    await notificationModel.updateMany(json, {
      notify_status: 'Read'
    },
      function (err, notify) {
        if (err) {
          res.json({ Status: "Failed", Message: err.message, Code: 500 });
        }
        else {
          res.json({ Status: "Success", Message: "Notification Status Changed successfully", Data: notify, Code: 200 });
        }
      });
  }
  catch (ex) {
    res.json({ Status: "Failed", Message: ex.message, Code: 500 });
  }
});


router.post('/filter_date', function (req, res) {
  notificationModel.find({}, function (err, StateList) {
    var final_Date = [];
    for (let a = 0; a < StateList.length; a++) {
      var fromdate = new Date(req.body.fromdate);
      var todate = new Date(req.body.todate);
      var checkdate = new Date(StateList[a].createdAt);
      console.log(fromdate, todate, checkdate);
      if (checkdate >= fromdate && checkdate <= todate) {
        final_Date.push(StateList[a]);
      }
      if (a == StateList.length - 1) {
        res.json({ Status: "Success", Message: "Demo screen  List", Data: final_Date, Code: 200 });
      }
    }
  });
});



router.post('/mobile/alert/notification', async function (req, res) {
  var appointment_id = req.body.appointment_UID;
  var title = '';
  var subtitle = '';
  var msg = '';
  var date = req.body.date;
  var data_type = {};
  if (req.body.status == "Payment Failed") {
    title = "Payment Failed";
    subtitle = "Payment Failed";
    body = "There was an error processing your appointment. Please try again";
    data_type = {
      "usertype": "1",
      "appintments": "",
      "orders": ""
    };

    sendnotify(req.body.user_id, title, body, subtitle, date);
  }
  else if (req.body.status == "Patient Appointment Cancelled") {
    appointmetitle = "Appointment Cancelled";
    doc_subtitle = "Appointment Cancelled";
    doc_body = "Patient Cancelled the appointment of " + appointment_id + " at " + date;
    pet_subtitle = "Appointment Cancelled";
    pet_body = "You have Cancelled the appointment of " + appointment_id + " at " + date;
    data_type = {
      "usertype": "1",
      "appintments": "",
      "orders": ""
    };

    sendnotify(req.body.user_id, title, pet_body, pet_subtitle, date);
    sendnotify(req.body.doctor_id, title, doc_body, doc_subtitle, date);
  }
  else if (req.body.status == "Doctor Appointment Cancelled") {
    title = "Appointment Cancelled";
    doc_subtitle = "Appointment Cancelled";
    doc_body = "You have Cancelled the appointment of " + appointment_id + " at " + date;
    pet_subtitle = "Appointment Cancelled";
    pet_body = "Doctor Cancelled the appointment of " + appointment_id + " at " + date;
    data_type = {
      "usertype": "1",
      "appintments": "",
      "orders": ""
    };

    sendnotify(req.body.user_id, title, pet_body, pet_subtitle, date);
    sendnotify(req.body.doctor_id, title, doc_body, doc_subtitle, date);
  }
  else if (req.body.status == "No show") {
    title = "Appointment Missed";
    doc_subtitle = "Appointment Missed";
    doc_body = "You have Missed the appointment of " + appointment_id + " at " + date;
    pet_subtitle = "Appointment Missed";
    pet_body = "You have Missed the appointment of " + appointment_id + " at " + date;
    data_type = {
      "usertype": "1",
      "appintments": "",
      "orders": ""
    };

    sendnotify(req.body.user_id, title, pet_body, pet_subtitle, date);
    sendnotify(req.body.doctor_id, title, doc_body, doc_subtitle, date);

  }


  else if (req.body.status == "Appointment Remainder") {
    title = "Appointment Remainder";
    doc_subtitle = "Appointment Remainder";
    doc_body = "You have an appointment of " + appointment_id + " at " + date;
    pet_subtitle = "Appointment Remainder";
    pet_body = "You have an appointment of " + appointment_id + " at " + date;
    data_type = {
      "usertype": "1",
      "appintments": "",
      "orders": ""
    };


    sendnotify(req.body.user_id, title, pet_body, pet_subtitle, date);
    sendnotify(req.body.doctor_id, title, doc_body, doc_subtitle, date);

  }

  else if (req.body.status == "Appointment Completed") {
    title = "Appointment Completed";
    doc_subtitle = "Appointment Completed";
    doc_body = "You have Completed the appointment of " + appointment_id + " at " + date;
    pet_subtitle = "Appointment Completed";
    pet_body = "You have Completed the appointment of " + appointment_id + " at " + date;
    data_type = {
      "usertype": "1",
      "appintments": "",
      "orders": ""
    };


    sendnotify(req.body.user_id, title, pet_body, pet_subtitle, date);
    sendnotify(req.body.doctor_id, title, doc_body, doc_subtitle, date);

  }
  async function sendnotify(user_id, title1, body1, subtitle1, datetime1, data_type) {


    let phone = await userdetailsModel.findOne({ _id: user_id });

    var user_id = user_id;
    var title1 = title1;
    var body1 = body1;
    var subtitle1 = subtitle1;
    var datetime1 = datetime1;
    var data_type = data_type;



    // userdetailsModel.findOne({_id:user_id},async function (err, phone) {
    // res.json({Status:"Success",Message:"Notification Details", Data : phone ,Code:200});
    // console.log(phone);
    const headers = {
      'Authorization': 'key=AAAAYMyisds:APA91bG589xvVYxUCdpF0qBvj_ktDtUvqgpM-TcmhN49uQK9a_JUmLqKHpos_x02exZh8z1ZCyiWm0o78ImcmhDf4L5mLlw5K2FXB1X_WCLXpte0XQhOhu4NiwE68vEgQ7z931OB_Bdw',
      'Content-Type': 'application/json'
    }
    // Set the message as high priority and have it expire after 24 hours.
    var options = {
      priority: "high",
      timeToLive: 60 * 60 * 24
    };
    var request1 = require("request");
    // firebase url
    var myURL1 = "https://fcm.googleapis.com/fcm/send";
    var body1 = {
      to: phone.fb_token,
      notification: {
        title: subtitle1,
        body: body1,
        subtitle: subtitle1,
        sound: "default"
      }
    };
    console.log(body1);
    request1.post(
      {
        url: myURL1,
        method: "POST",
        headers,
        body: body1,
        options,
        json: true
      }, function (error, response, body1) {
        if (error) {
          return res.json(
            _.merge(
              {
                error: error
              },
              utils.errors["500"]
            )
          );
        } else {
          console.log(response.body);
          console.log("Firebase Send");
        }
      });

    try {
      await notificationModel.create({
        user_id: phone._id,
        notify_title: subtitle1,
        notify_descri: body1.notification.body,
        notify_img: "",
        notify_time: datetime1,
        date_and_time: datetime1
      },
        function (err, user) {
          console.log(user)
          console.log(err)

          // res.json({Status:"Success",Message:"Notification Added successfully", Data : user ,Code:200}); 
        });
    } catch (e) {
      res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    }

    // });

  }
  res.json({ Status: "Success", Message: "Notification Send successfully", Data: {}, Code: 200 });
});





router.post('/mobile/alert/sp_notification', async function (req, res) {

  console.log("sp_notification", req.body);
  var appointment_id = req.body.appointment_UID;
  var title = '';
  var subtitle = '';
  var msg = '';
  var date = req.body.date;
  if (req.body.status == "Payment Failed") {
    title = "Payment Failed";
    subtitle = "Payment Failed";
    body = "There was an error processing your appointment. Please try again"
    sendnotify(req.body.user_id, title, body, subtitle, date);
  }
  else if (req.body.status == "Patient Appointment Cancelled") {
    appointmetitle = "Appointment Cancelled";
    doc_subtitle = "Appointment Cancelled";
    doc_body = "Patient Cancelled the appointment of " + appointment_id + " at " + date;
    pet_subtitle = "Appointment Cancelled";
    pet_body = "You have Cancelled the appointment of " + appointment_id + " at " + date;
    sendnotify(req.body.user_id, title, pet_body, pet_subtitle, date);
    sendnotify(req.body.sp_id, title, doc_body, doc_subtitle, date);
  }
  else if (req.body.status == "Doctor Appointment Cancelled") {
    title = "Appointment Cancelled";
    doc_subtitle = "Appointment Cancelled";
    doc_body = "You have cancelled the appointment of " + appointment_id + " at " + date;
    pet_subtitle = "Appointment Cancelled";
    pet_body = "SP Cancelled the appointment of " + appointment_id + " at " + date;
    sendnotify(req.body.user_id, title, pet_body, pet_subtitle, date);
    sendnotify(req.body.sp_id, title, doc_body, doc_subtitle, date);
  }
  else if (req.body.status == "No show") {

    title = "Appointment Missed";
    doc_subtitle = "Appointment Missed";
    doc_body = "You have missed the appointment of " + appointment_id + " at " + date;
    pet_subtitle = "Appointment Missed";
    pet_body = "You have missed the appointment of " + appointment_id + " at " + date;
    sendnotify(req.body.user_id, title, pet_body, pet_subtitle, date);
    sendnotify(req.body.sp_id, title, doc_body, doc_subtitle, date);

  }


  else if (req.body.status == "Appointment Remainder") {
    title = "Appointment Remainder";
    doc_subtitle = "Appointment Remainder";
    doc_body = "You have an appointment of " + appointment_id + " at " + date;
    pet_subtitle = "Appointment Remainder";
    pet_body = "You have an appointment of " + appointment_id + " at " + date;
    sendnotify(req.body.user_id, title, pet_body, pet_subtitle, date);
    sendnotify(req.body.sp_id, title, doc_body, doc_subtitle, date);

  }

  else if (req.body.status == "Appointment Completed") {
    title = "Appointment Completed";
    doc_subtitle = "Appointment Completed";
    doc_body = "You have Completed the appointment of " + appointment_id + " at " + date;
    pet_subtitle = "Appointment Completed";
    pet_body = "You have Completed the appointment of " + appointment_id + " at " + date;
    sendnotify(req.body.user_id, title, pet_body, pet_subtitle, date);
    sendnotify(req.body.sp_id, title, doc_body, doc_subtitle, date);

  }

  async function sendnotify(user_id, title1, body1, subtitle1, datetime1) {
    console.log(user_id, title1, body1, subtitle1, datetime1);

    let phone = await userdetailsModel.findOne({ _id: user_id });

    var user_id = user_id;
    var title1 = title1;
    var body1 = body1;
    var subtitle1 = subtitle1;
    var datetime1 = datetime1;


    // userdetailsModel.findOne({_id:user_id},async function (err, phone) {
    // res.json({Status:"Success",Message:"Notification Details", Data : phone ,Code:200});
    // console.log(phone);
    const headers = {
      'Authorization': 'key=AAAAYMyisds:APA91bG589xvVYxUCdpF0qBvj_ktDtUvqgpM-TcmhN49uQK9a_JUmLqKHpos_x02exZh8z1ZCyiWm0o78ImcmhDf4L5mLlw5K2FXB1X_WCLXpte0XQhOhu4NiwE68vEgQ7z931OB_Bdw',
      'Content-Type': 'application/json'
    }
    // Set the message as high priority and have it expire after 24 hours.
    var options = {
      priority: "high",
      timeToLive: 60 * 60 * 24
    };
    var request1 = require("request");
    // firebase url
    var myURL1 = "https://fcm.googleapis.com/fcm/send";
    var body1 = {
      to: phone.fb_token,
      notification: {
        title: title1,
        body: body1,
        subtitle: subtitle1,
        sound: "default"
      }
    };
    console.log(body1);
    request1.post(
      {
        url: myURL1,
        method: "POST",
        headers,
        body: body1,
        options,
        json: true
      }, function (error, response, body1) {
        if (error) {
          return res.json(
            _.merge(
              {
                error: error
              },
              utils.errors["500"]
            )
          );
        } else {
          console.log(response.body);
          console.log("Firebase Send");
        }
      });

    try {
      await notificationModel.create({
        user_id: phone._id,
        notify_title: subtitle1,
        notify_descri: body1.notification.body,
        notify_img: "",
        notify_time: datetime1,
        date_and_time: datetime1
      },
        function (err, user) {
          console.log(user)
          // res.json({Status:"Success",Message:"Notification Added successfully", Data : user ,Code:200}); 
        });
    } catch (e) {
      res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    }

    // });

  }
  res.json({ Status: "Success", Message: "Notification Send successfully", Data: {}, Code: 200 });
});




router.post('/admin_send_notification', function (req, res) {
  res.json({ Status: "Success", Message: "Notification Send successfully", Data: '', Code: 200 });
});


router.post('/sendnotification_doc_start', async function (req, res) {
  let phone = await userdetailsModel.findOne({ _id: req.body.user_id });
  const headers = {
    'Authorization': 'key=AAAAYMyisds:APA91bG589xvVYxUCdpF0qBvj_ktDtUvqgpM-TcmhN49uQK9a_JUmLqKHpos_x02exZh8z1ZCyiWm0o78ImcmhDf4L5mLlw5K2FXB1X_WCLXpte0XQhOhu4NiwE68vEgQ7z931OB_Bdw',
    'Content-Type': 'application/json'
  }
  // Set the message as high priority and have it expire after 24 hours.
  var options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
  };
  var request1 = require("request");
  // firebase url
  var myURL1 = "https://fcm.googleapis.com/fcm/send";
  var body1 = {
    to: phone.user_token,
    notification: {
      title: "Appointment",
      body: "Doctor Start the appointment, waiting for you",
      subtitle: "Appointment Startard....",
      sound: "default"
    }
  };
  request1.post(
    {
      url: myURL1,
      method: "POST",
      headers,
      body: body1,
      options,
      json: true
    }, function (error, response, body1) {
      if (error) {
        return res.json(
          _.merge(
            {
              error: error
            },
            utils.errors["500"]
          )
        );
      } else {
        console.log(response.body);
        console.log("Firebase Send");
      }
    });

  try {
    await notificationModel.create({
      user_id: req.body.user_id,
      notify_title: "Appointment",
      notify_descri: "Doctor Start the appointment, waiting for you",
      notify_img: "",
      notify_time: "",
      date_and_time: req.body.date_and_time
    },
      function (err, user) {
        console.log(user)
        res.json({ Status: "Success", Message: "Notification Added successfully", Data: user, Code: 200 });
      });
  }
  catch (e) {
    res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
  }
});




router.post('/send_notifiation', async function (req, res) {
  let johnson_detail = await userdetailsModel.find({});
  let count = johnson_detail.length;
  let count_init = 0;
  recall();
  async function recall() {
    if (count_init < johnson_detail.length) {
      if (johnson_detail[count_init].fb_token !== "") {
        console.log(johnson_detail[count_init].fb_token);
        const headers = {
          'Authorization': 'key=AAAAW75crWY:APA91bHuygZXPsNXaFieoxxE8SD0xqmJI87aeTSee4krllWKSk2SMDpvFjtVJcz3FZ9sRnwDBVQNe7mV2mWBKaP4bM524zxmFQlijO2iXl4lGAw6l7gs6AEnmR2vANb89Wdrb7svaFHP',
          'Content-Type': 'application/json'
        }
        // Set the message as high priority and have it expire after 24 hours.
        var options = {
          priority: "high",
          timeToLive: 60 * 60 * 24
        };
        var request1 = require("request");
        // firebase url
        var myURL1 = "https://fcm.googleapis.com/fcm/send";
        var body1 = {
          to: johnson_detail[count_init].fb_token,
          notification: {
            title: req.body.notify_title,
            body: req.body.notify_descri,
            subtitle: req.body.notify_title,
            sound: "default"
          }
        };
        request1.post(
          {
            url: myURL1,
            method: "POST",
            headers,
            body: body1,
            options,
            json: true
          }, function (error, response, body1) {
            if (error) {
              return res.json(
                _.merge(
                  {
                    error: error
                  },
                  utils.errors["500"]
                )
              );
            } else {
              console.log(response.body);
              console.log(response.body1);
              console.log("Firebase Send");
            }
          });

        try {
          await notificationModel.create({
            user_id: johnson_detail[count_init]._id,
            notify_title: req.body.notify_title,
            notify_descri: req.body.notify_descri,
            notify_img: req.body.notify_img || "",
            notify_time: "",
            date_and_time: req.body.date_and_time
          },
            function (err, user) {
              console.log(user)
              count_init = count_init + 1;
              recall();
              // res.json({Status:"Success",Message:"Notification Added successfully", Data : user ,Code:200}); 
            });
        }
        catch (e) {
          res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
        }


      } else {
        count_init = count_init + 1;
        recall();
      }
    } else {
      res.json({ Status: "Success", Message: "Notification Sent successfully", Data: {}, Code: 200 });
    }
  }



});




router.post('/send_notifiation_update', async function (req, res) {
  let johnson_detail = await tickethistoryModel.find({ ticket_no: req.body.ticket_no }).populate("user_id");
  let count = johnson_detail.length;
  let count_init = 0;
  recall();
  async function recall() {
    if (count_init < johnson_detail.length) {
      console.log(johnson_detail[count_init].user_id.fb_token);

      console.log(johnson_detail[count_init].user_id.fb_token);
      console.log("Notification Send Request", req.body);
      const headers = {
        'Authorization': 'key=AAAAW75crWY:APA91bHuygZXPsNXaFieoxxE8SD0xqmJI87aeTSee4krllWKSk2SMDpvFjtVJcz3FZ9sRnwDBVQNe7mV2mWBKaP4bM524zxmFQlijO2iXl4lGAw6l7gs6AEnmR2vANb89Wdrb7svaFHP',
        'Content-Type': 'application/json'
      }
      // Set the message as high priority and have it expire after 24 hours.
      var options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
      };
      var request1 = require("request");
      // firebase url
      var myURL1 = "https://fcm.googleapis.com/fcm/send";
      var body1 = {
        to: johnson_detail[count_init].user_id.fb_token,
        notification: {
          title: req.body.notify_title,
          body: req.body.notify_descri,
          subtitle: req.body.notify_title,
          sound: "default"
        }
      };
      request1.post(
        {
          url: myURL1,
          method: "POST",
          headers,
          body: body1,
          options,
          json: true
        }, function (error, response, body1) {
          if (error) {
            return res.json(
              _.merge(
                {
                  error: error
                },
                utils.errors["500"]
              )
            );
          } else {
            console.log(response.body);
            console.log(response.body1);
            console.log("Firebase Send");
          }
        });

      try {
        await notificationModel.create({
          user_id: johnson_detail[count_init].user_id._id,
          notify_title: req.body.notify_title,
          notify_descri: req.body.notify_descri,
          notify_img: req.body.notify_img || "",
          notify_time: "",
          date_and_time: req.body.date_and_time
        },
          function (err, user) {
            console.log(user)
            count_init = count_init + 1;
            recall();
            // res.json({Status:"Success",Message:"Notification Added successfully", Data : user ,Code:200}); 
          });
      }
      catch (e) {
        res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
      }


    } else {
      res.json({ Status: "Success", Message: "Notification Sent successfully", Data: {}, Code: 200 });
    }
  }



});


router.get('/deletes', function (req, res) {
  notificationModel.remove({}, function (err, user) {
    if (err) return res.status(500).send("There was a problem deleting the user.");
    res.json({ Status: "Success", Message: "Notification Deleted", Data: {}, Code: 200 });
  });
});


router.post('/mobile/getlist_id', function (req, res) {
  let json = { user_id: req.body.user_id };
  if (req.body.status) {
    json.notify_status = req.body.status;
  }
  notificationModel.find(json, { createdAt: 0, updatedAt: 0, delete_status: 0 }, { sort: { _id: -1 } }, function (err, notifications) {
    res.json({ Status: "Success", Message: "Notification List", Data: notifications, Code: 200 });
  });
});



router.get('/getlist', async function (req, res) {
  let json = { delete_status: false };
  let skip = 0, limit = 10;
  if (req.query.user_id) {
    json.user_id = req.query.user_id;
  }
  if (req.query.skip) {
    skip = parseInt(req.query.skip);
  }
  if (req.query.limit) {
    limit = parseInt(req.query.limit);
  }
  json.notify_status = 'Unread';
  let unreadCount = await notificationModel.find(json).countDocuments();
  delete json.notify_status;
  await notificationModel.find(json, {}, { skip: skip, limit: limit, sort: { notifiy_status: -1, _id: -1 } }, function (err, notificationsList) {
    if (err) {
      res.json({ Status: "Failed", Message: err.message, Code: 500 });
    } else {
      res.json({ Status: "Success", Message: "Notification Details", Data: notificationsList, Count: unreadCount, Code: 200 });
    }
  });
});


router.post('/mark_readed', function (req, res) {
  notificationModel.find({ user_id: req.body.user_id, delete_status: false }, async function (err, Functiondetails) {
    console.log(Functiondetails.length);
    if (Functiondetails.length == 0) {
      res.json({ Status: "Success", Message: "Notification Marked Readed", Data: {}, Code: 200 });
    } else {
      for (let a = 0; a < Functiondetails.length; a++) {
        let c = {
          delete_status: true
        }
        console.log(Functiondetails[a]._id);
        notificationModel.findByIdAndUpdate(Functiondetails[a]._id, c, { new: true }, function (err, UpdatedDetails) {
          if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
          // res.json({Status:"Success",Message:"Location Deleted successfully", Data : UpdatedDetails ,Code:200});
        });
        if (a == Functiondetails.length - 1) {
          res.json({ Status: "Success", Message: "Notification Details", Data: {}, Code: 200 });
        }
      }
    }
  });
});


router.get('/mobile/getlist', function (req, res) {
  notificationModel.find({}, function (err, Functiondetails) {
    let a = {
      usertypedata: Functiondetails
    }
    res.json({ Status: "Success", Message: "Notification Details", Data: a, Code: 200 });
  });
});

router.post('/edit', function (req, res) {
  notificationModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Notification Updated", Data: UpdatedDetails, Code: 200 });
  });
});


router.post('/delete', function (req, res) {
  let c = {
    delete_status: true
  }
  notificationModel.findByIdAndUpdate(req.body._id, c, { new: true }, function (err, UpdatedDetails) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Location Deleted successfully", Data: UpdatedDetails, Code: 200 });
  });
});

// // DELETES A USER FROM THE DATABASE
router.post('/admin_delete', function (req, res) {
  notificationModel.findByIdAndRemove(req.body._id, function (err, user) {
    if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
    res.json({ Status: "Success", Message: "Notification Deleted successfully", Data: {}, Code: 200 });
  });
});

module.exports = router;

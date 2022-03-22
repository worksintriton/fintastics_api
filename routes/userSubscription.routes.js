let express = require('express');
let router = express.Router();
let subscriptionModel = require('./../models/subscriptionModel');
let userSubscriptionModel = require('./../models/userSubscriptionModel');
let notificationModel = require('./../models/notificationModel');

router.post("/create", async function (req, res) {
    try {
        let list = await subscriptionModel.find({ _id: req.body.subscriptionid }, { title: 1, months: 1, amount: 1 });
        if (list.length > 0) {
            let enddate = new Date(new Date().setMonth(new Date().getMonth() + list[0].months));
            await userSubscriptionModel.create({
                userid: req.body.userid,
                subscriptionid: req.body.subscriptionid,
                startdate: new Date(),
                enddate: enddate,
                amount: list[0].amount,
                expired: false,
                payment_ref_id: req.body.payment_ref_id,
                delete_status: false
            },
               async function (err, subscription) {
                    if (err) {
                        res.json({ "Status": "Failure", Message: err.message, Code: 500 });
                    } else {

                        await notificationModel.create({
                            user_id: req.body.user_id,
                            notify_title: 'Subscription Added',
                            notify_descri: list[0].title+" subscribed",
                            notify_img: '/images/notification/subscription-added.png',
                            notify_time: '',
                            notify_status: 'Unread',
                            notify_color: '#C5317B',
                            date_and_time: new Date().toISOString(),
                            delete_status: false
                          },
                            function (err, notification) {
                              //res.json({ Status: "Success", Message: "Notification Added successfully", Data: res, Code: 200 });
                              res.json({ Status: "Success", Message: "Added successfully", Data: subscription, Code: 200 });
                            });

                        //res.json({ Status: "Success", Message: "Added successfully", Data: subscription, Code: 200 });
                    }
                });
        }
        else {
            res.json({ "Status": "Failure", Message: "Wrong Subscription Id", Code: 500 });
        }
    }
    catch (ex) {
        res.json({ "Status": "Failure", Message: ex.message, Code: 500 });
    }
});

router.get('/deletes', function (req, res) {
    userSubscriptionModel.remove({}, function (err, user) {
        if (err) return res.status(500).send("There was a problem deleting the user.");
        res.json({ Status: "Success", Message: "Subscription Deleted", Data: {}, Code: 200 });
    });
});

router.post('/getlist_id', function (req, res) {
    userSubscriptionModel.find({ _id: req.body._id, delete_status: false }, function (err, list) {
        res.json({ Status: "Success", Message: "Subscription List", Data: list, Code: 200 });
    });
});

router.get('/getlist', function (req, res) {
    userSubscriptionModel.find({ delete_status: false }, function (err, list) {
        res.json({ Status: "Success", Message: "Subscription Details", Data: list, Code: 200 });
    });
});

router.post('/edit', function (req, res) {
    userSubscriptionModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
        if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
        res.json({ Status: "Success", Message: "Subscription Updated", Data: UpdatedDetails, Code: 200 });
    });
});

router.post('/delete', function (req, res) {
    userSubscriptionModel.findByIdAndRemove(req.body._id, function (err, user) {
        if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
        res.json({ Status: "Success", Message: "Subscription Deleted successfully", Data: {}, Code: 200 });
    });
});

module.exports = router;
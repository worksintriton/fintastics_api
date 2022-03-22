let express = require('express');
let router = express.Router();
let subscriptionModel = require('./../models/subscriptionModel');

router.post("/create", async function (req, res) {
    try {
        await subscriptionModel.create({
            title: req.body.title,
            type: req.body.type,
            months: req.body.months,
            amount: req.body.amount,
            currency: req.body.currency,
            benefits: req.body.benefits,
            delete_status: false
        },
            function (err, subscription) {
                if (err) {
                    res.json({ "Status": "Failure", Message: err.message, Code: 500 });
                } else {
                    res.json({ Status: "Success", Message: "Added successfully", Data: subscription, Code: 200 });
                }
            });
    }
    catch (ex) {
        res.json({ "Status": "Failure", Message: ex.message, Code: 500 });
    }
});

router.get('/deletes', function (req, res) {
    subscriptionModel.remove({}, function (err, user) {
        if (err) return res.status(500).send("There was a problem deleting the user.");
        res.json({ Status: "Success", Message: "User Subscription Deleted", Data: {}, Code: 200 });
    });
});

router.post('/getlist_id', function (req, res) {
    subscriptionModel.find({ userid: req.body.userid, delete_status: false }, function (err, list) {
        res.json({ Status: "Success", Message: "User Subscription List", Data: list, Code: 200 });
    });
});

router.get('/getlist', function (req, res) {
    subscriptionModel.find({ delete_status: false }, { createdAt: 0, updatedAt: 0, delete_status: 0, __v: 0 }, function (err, list) {
        res.json({ Status: "Success", Message: "User Subscription Details", Data: list, Code: 200 });
    });
});

router.post('/edit', function (req, res) {
    subscriptionModel.findByIdAndUpdate(req.body._id, req.body, { new: true }, function (err, UpdatedDetails) {
        if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
        res.json({ Status: "Success", Message: "User Subscription Updated", Data: UpdatedDetails, Code: 200 });
    });
});

router.post('/delete', function (req, res) {
    subscriptionModel.findByIdAndRemove(req.body._id, function (err, user) {
        if (err) return res.json({ Status: "Failed", Message: "Internal Server Error", Data: {}, Code: 500 });
        res.json({ Status: "Success", Message: "User Subscription Deleted successfully", Data: {}, Code: 200 });
    });
});

module.exports = router;
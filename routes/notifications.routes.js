const express = require('express');
const router = express.Router();
const notifController = require("../controllers/notifications.controller.js");

router.route('/')
    .get(notifController.getAllNotifications)


module.exports = router;
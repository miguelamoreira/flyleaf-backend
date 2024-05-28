const express = require('express');
const router = express.Router();
const notifController = require("../controllers/notifications.controller.js");
const { verifyToken, isAdmin, isRegularUser } = require("../middlewares/auth.middleware.js");

router.route('/')
    .get(verifyToken, notifController.findAllNotifications)

router.route('/settings')
    .patch(verifyToken, notifController.updateNotifications)

module.exports = router;
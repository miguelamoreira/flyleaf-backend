const express = require('express');
const router = express.Router();
const readingsController = require("../controllers/readings.controller.js");
const { verifyToken, isAdmin, isRegularUser } = require("../middlewares/auth.middleware.js");

router.route('/')
    .get(verifyToken, readingsController.findAllReadings)
    .post(verifyToken, readingsController.createReading)


module.exports = router;
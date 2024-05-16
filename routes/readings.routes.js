const express = require('express');
const router = express.Router();
const readingsController = require("../controllers/readings.controller.js");

router.route('/')
    .get(readingsController.findAllReadings)
    .post(readingsController.createReading)


module.exports = router;
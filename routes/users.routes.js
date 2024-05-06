const express = require('express');
const router = express.Router();
const userController = require("../controllers/users.controller");

// USERS
router.route('/users')
    .get(userController.findAll);

module.exports = router;

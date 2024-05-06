const express = require('express');
const router = express.Router();
const userController = require("../controllers/users.controller.js");

// USERS
router.route('/')
    .get(userController.findAll)
    .post(userController.create);

router.route('/:userId')
    .get(userController.findOne)
    .delete(userController.delete)
    .put(userController.update)
    .patch(userController.toggleState)

module.exports = router;

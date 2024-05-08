const express = require('express');
const router = express.Router();
const userController = require("../controllers/users.controller.js");
const authenticate = require('../middlewares/auth.middleware.js');

// USERS
router.route('/login')
    .post(userController.login)
    
router.route('/')
    .get(userController.findAll)
    .post(userController.create);

router.route('/:userId')
    .get(authenticate, userController.findOne)
    .delete(authenticate, userController.delete)
    .put(authenticate, userController.update)
    .patch(authenticate, userController.toggleState)

module.exports = router;

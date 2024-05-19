const express = require('express');
const router = express.Router();
const userController = require("../controllers/users.controller.js");
const { verifyToken, isAdmin, isRegularUser } = require("../middlewares/auth.middleware.js");

// USERS
router.route('/login')
    .post(userController.login)
    
router.route('/')
    .get(verifyToken, isAdmin, userController.findAll)
    .post(userController.create);

router.route('/:userId')
    .get(userController.findOne)
    .delete(verifyToken, isAdmin, userController.delete)
    .put(userController.update)
    .patch(verifyToken, isAdmin, userController.toggleState)

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require("../controllers/users.controller.js");
const { verifyToken, isAdmin, isRegularUser } = require("../middlewares/auth.middleware.js");

// USERS
router.route('/login')
    .post(userController.login)
    
router.route('/')
    .get(verifyToken, userController.findAll)
    .post(userController.create);

router.route('/:userId')
    .get(userController.findOne)
    .delete(verifyToken, isAdmin, userController.delete)
    .put(userController.update)
    .patch(verifyToken, isAdmin, userController.toggleState)

router.route('/:userId/avatar')
    .patch(verifyToken, userController.updateAvatar)

router.route('/:userId/favourites')
    .get(verifyToken, userController.findAllFavouritesByUserId)
    .post(verifyToken, userController.addFavourites)
    .delete(verifyToken, userController.deleteFavourite)
    .put(userController.updateFavourites)

module.exports = router;

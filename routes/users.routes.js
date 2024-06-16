const express = require('express');
const router = express.Router();
const userController = require("../controllers/users.controller.js");
const notifController = require("../controllers/notifications.controller.js")
const { verifyToken, isAdmin, isRegularUser } = require("../middlewares/auth.middleware.js");

// USERS
router.route('/login')
    .post(userController.login)
    
router.route('/')
    .get(verifyToken, userController.findAll)
    .post(userController.create);

router.route('/:userId')
    .get(verifyToken, userController.findOne)
    .delete(verifyToken, isAdmin, userController.delete)
    .put(verifyToken, userController.update)

router.route('/:userId/state')
    .patch(verifyToken, isAdmin, userController.toggleState)

router.route('/:userId/avatar')
    .patch(verifyToken, userController.updateAvatar)

router.route('/:userId/favourites')
    .get(verifyToken, userController.findAllFavouritesByUserId)
    .post(verifyToken, userController.addFavourites)
    .delete(verifyToken, userController.deleteFavourite)
    .put(verifyToken, userController.updateFavourites)

router.route('/:userId/notifications/settings')
    .get(notifController.findAllNotifSettingsByUserId)
    .patch(verifyToken, notifController.updateNotifications)

router.route('/:userId/favouriteGenres')
    .put(verifyToken, notifController.updateFavouriteGenres)

module.exports = router;

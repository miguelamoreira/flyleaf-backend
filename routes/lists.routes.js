const express = require('express');
const router = express.Router();
const listsController = require("../controllers/lists.controller.js");
const { verifyToken, isAdmin, isRegularUser } = require("../middlewares/auth.middleware.js");

router.route('/')
    .get(verifyToken, listsController.findAllLists)
    .post(verifyToken, listsController.createList)

router.route('/:readingListId')
    .get(verifyToken, listsController.findListById)
    .delete(verifyToken, listsController.deleteList)
    .patch(verifyToken, listsController.editList)

module.exports = router;
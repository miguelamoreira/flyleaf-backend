const express = require('express');
const router = express.Router();
const listsController = require("../controllers/lists.controller.js");
const { verifyToken, isAdmin, isRegularUser } = require("../middlewares/auth.middleware.js");

router.route('/')
    .get(verifyToken, listsController.findAllLists)

module.exports = router;
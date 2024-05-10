const express = require('express');
const router = express.Router();
const listsController = require("../controllers/lists.controller.js");

router.route('/')
    .get(listsController.findAllLists)


module.exports = router;
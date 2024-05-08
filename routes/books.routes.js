const express = require('express');
const router = express.Router();
const bookController = require("../controllers/books.controller.js");

router.route('/')
    .get(bookController.findAllBooks)

router.route('/:bookId')
    .get(bookController.findOne)

module.exports = router;
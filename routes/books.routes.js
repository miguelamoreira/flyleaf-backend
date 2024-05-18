const express = require('express');
const router = express.Router();
const bookController = require("../controllers/books.controller.js");
const bookReviewController = require("../controllers/bookReviews.controller.js")

router.route('/')
    .get(bookController.findAllBooks)

router.route('/:bookId')
    .get(bookController.findOne)

router.route('/:bookId/reviews')
    .get(bookReviewController.findAllReviewsByBookId)
    .post(bookReviewController.createReviewOrReading);

router.route('/:bookId/reviews/:reviewId')
    .patch(bookReviewController.updateReview)
    .delete(bookReviewController.deleteReview);

module.exports = router;
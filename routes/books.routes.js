const express = require('express');
const router = express.Router();
const bookController = require("../controllers/books.controller.js");
const bookReviewController = require("../controllers/bookReviews.controller.js")
const { verifyToken, isAdmin, isRegularUser } = require("../middlewares/auth.middleware.js");


router.route('/')
    .get(verifyToken, bookController.findAllBooks)

router.route('/highest-rated')
    .get(bookController.getHighestRatedBook)
    
router.route('/:bookId')
    .get(verifyToken, bookController.findOne)
    .delete(verifyToken, isAdmin, bookController.deleteBookById)

router.route('/:bookId/reviews')
    .get(verifyToken, bookReviewController.findAllReviewsByBookId)
    .post(verifyToken, bookReviewController.createReviewOrReading);

router.route('/:bookId/reviews/:reviewId')
    .patch(verifyToken, bookReviewController.updateReview)
    .delete(verifyToken, bookReviewController.deleteReview);

module.exports = router;
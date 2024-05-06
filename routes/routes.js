const express = require('express');
const router = express.Router();

// controllers

// USERS
router.post('/users/login', (req, res) => {
});
  
router.post('/users', (req, res) => {
});

router.route('/users/:userId')
    .get()
    .post()
    .delete()

router.route('/users/:userId/favourites') 
    .get()
    .put()

// BOOKS
router.get('/books', (req, res) => {
  });
  
router.get('/books/:bookId', (req, res) => {
});

// REQUESTS
router.route('/requests')
    .get()
    .post()

router.route('requests/:requestId')
    .patch()
    .delete()

// READING LISTS
router.route('/reading-lists')
    .get()
    .post()

router.route('/reading-lists/:readingListId')
    .get()
    .patch()
    .delete()

// READINGS
router.route('/readings')
    .get()
    .post()

router.route('/readings/readingId')
    .patch()
    .delete()

// NOTIFICATIONS
router.get('/notifications', (req, res) => {
    
});

router.patch('/notifications/settings', (req, res) => {
    
});

// REVIEWS
router.route('/books/:bookId/reviews')
    .get()
    .post()

router.route('/books/:bookId/reviews/:reviewId')
    .patch()
    .delete()

// AUTHORS
router.route('/authors')
    .get()
    .post()

// CATEGORIES
router.get('/categories', (req, res) => {

})

module.exports = router;
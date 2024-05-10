const express = require('express');
const router = express.Router();
const bookRequestsController = require('../controllers/bookRequests.controller.js');
const authenticate = require('../middlewares/auth.middleware.js');

router.route('/')
    .get(authenticate, bookRequestsController.findUserRequests)
    .post(authenticate, bookRequestsController.createRequest)

router.route('/:requestId')
    .patch(bookRequestsController.updateRequestState)
    .delete(bookRequestsController.deleteRequest)

module.exports = router;

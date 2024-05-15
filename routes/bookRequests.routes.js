const express = require('express');
const router = express.Router();
const bookRequestsController = require('../controllers/bookRequests.controller.js');
const authenticate = require('../middlewares/auth.middleware.js');

router.route('/')
    .get(bookRequestsController.findAllRequests)
    .post(bookRequestsController.createRequest)

router.route('/:requestId')
    .patch(bookRequestsController.updateRequestState)

module.exports = router;

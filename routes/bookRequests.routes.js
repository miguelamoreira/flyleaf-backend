const express = require('express');
const router = express.Router();
const bookRequestsController = require('../controllers/bookRequests.controller.js');
const { verifyToken, isAdmin, isRegularUser } = require("../middlewares/auth.middleware.js");

router.route('/')
    .get(verifyToken, bookRequestsController.findAllRequests)
    .post(verifyToken, bookRequestsController.createRequest)

router.route('/:requestId')
    .patch(verifyToken, isAdmin, bookRequestsController.updateRequestState)

module.exports = router;

const express = require('express');
const router = express.Router();
const bookRequestsController = require('../controllers/bookRequests.controller.js');
const { verifyToken, isAdmin, isRegularUser } = require("../middlewares/auth.middleware.js");
const cloudinary = require("cloudinary").v2;
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// cloudinary configuration
cloudinary.config({
    cloud_name: process.env.C_CLOUD_NAME,
    api_key: process.env.C_API_KEY,
    api_secret: process.env.C_API_SECRET,
  });

router.route('/')
    .get(verifyToken, bookRequestsController.findAllRequests)
    .post(verifyToken, upload.single('cover'), bookRequestsController.createRequest)

router.route('/:requestId')
    .patch(verifyToken, isAdmin, bookRequestsController.updateRequestState)

module.exports = router, upload;

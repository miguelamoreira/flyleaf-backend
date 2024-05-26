const express = require('express');
const router = express.Router();
const genresController = require("../controllers/genres.controller.js");
const { verifyToken, isAdmin, isRegularUser } = require("../middlewares/auth.middleware.js");

router.route('/')
    .get(verifyToken, genresController.findAllGenres)

module.exports = router;
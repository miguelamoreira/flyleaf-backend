const express = require('express');
const router = express.Router();
const genresController = require("../controllers/genres.controller.js");

router.route('/')
    .get(genresController.findAllGenres)


module.exports = router;
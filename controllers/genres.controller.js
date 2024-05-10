const db = require("../models/index.js");
const Categoria = db.categoria;

// Retrieve all genres
exports.findAllGenres = async (req, res) => {
    try {
        const genres = await Categoria.findAll();
        res.status(200).json({
            message: "Genres retrieved successfully.",
            data: genres
        });
    } catch (error) {
        res.status(500).json({message: "Something went wrong. Please try again later."});
    }
}
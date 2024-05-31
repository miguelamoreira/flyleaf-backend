const db = require("../models/index.js");
const Categoria = db.categoria;

// Retrieve all genres
exports.findAllGenres = async (req, res) => {
    try {
        const genres = await Categoria.findAll();

        if (!genres) {
            return res.status(404).json({msg: "No book categories were found."})
        }

        return res.status(200).json({
            msg: "Book categories retrieved successfully.",
            data: genres
        });
    } catch (error) {
        res.status(500).json({msg: "Something went wrong. Please try again later."});
    }
}
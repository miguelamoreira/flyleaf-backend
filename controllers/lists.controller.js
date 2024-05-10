const { Op } = require("sequelize");
const db = require("../models/index.js");
const Livro = db.livro;
const listaLeitura = db.listaLeitura;

// Retrieve all lists
exports.findAllLists = async (req, res) => {
    try {
        const lists = await listaLeitura.findAll({
            include: [Livro] 
        });
        
        return res.status(200).json({
            message: "Lists retrieved successfully.",
            data: lists
        });
    } catch (error) {
        console.error("Error fetching lists:", error);
        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};
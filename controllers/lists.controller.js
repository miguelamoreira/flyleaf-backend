const { Op } = require("sequelize");
const db = require("../models/index.js");
const Livro = db.livro;
const listaLeitura = db.listaLeitura;

const convertBinaryToBase64 = (binaryData) => {
    return Buffer.from(binaryData).toString('base64');
};

// Retrieve all lists
exports.findAllLists = async (req, res) => {
    try {
        const lists = await listaLeitura.findAll({
            include: [Livro] 
        });

        if (!lists) {
            return res.status(404).json({msg: "No reading lists were found."});
        }

        for (let i = 0; i < lists.length; i++) {
            let livros = lists[i].Livros;
            for (let j = 0; j < livros.length; j++) {
                if (livros[j].capaLivro) {
                    livros[j].capaLivro = convertBinaryToBase64(livros[j].capaLivro);
                }
            }
        }

        return res.status(200).json({
            msg: "Lists retrieved successfully.",
            data: lists
        });
    } catch (error) {
        console.error("Error fetching lists:", error);
        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};
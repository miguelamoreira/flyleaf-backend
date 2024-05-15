const { Op } = require("sequelize");
const db = require("../models/index.js");
const Livro = db.livro;
const Autor = db.autor;
const Categoria = db.categoria;

exports.findAllBooks = async (req, res) => {
    const { nomeLivro, anoLivro, autorLivro, categoriaLivro } = req.query;
    
    try {
        let books;

        const whereOptions = {};

        if (anoLivro) {
            whereOptions.anoLivro = anoLivro;
        }

        if (autorLivro) {
            whereOptions['$autores.nomeAutor$'] = { [Op.like]: `%${autorLivro}%` };
        }        

        if (categoriaLivro) {
            whereOptions['$categoria.nomeCategoria$'] = { [Op.like]: `%${categoriaLivro}%` };
        }

        if (nomeLivro) {
            whereOptions.nomeLivro = { [Op.like]: `%${nomeLivro}%` };
        }

        const isEmpty = Object.keys(whereOptions).length === 0;

        books = await Livro.findAll({
            where: isEmpty ? {} : whereOptions,
            include: [
                { 
                    model: Autor, 
                    as: 'autors', 
                    attributes: ['nomeAutor'], 
                    through: { attributes: [] } 
                }, 
                { 
                    model: Categoria, 
                    as: 'categoria', 
                    attributes: ['nomeCategoria'] 
                } 
            ],                      
            raw: true
        });

        return res.status(200).json({
            msg: "Books retrieved successfully.",
            data: books
        });
    } catch (err) {
        res.status(500).json({msg: err.message || "Something went wrong. Please try again later."});
    }
};

// Retrieve a single book
exports.findOne = async (req, res) => {
    try {
        let book = await Livro.findByPk(req.params.bookId);

        if (!book) {
            return res.status(404).json({msg: "The requested book was not found."});
        }

        return res.status(200).json({
            msg: "Book retrieved successfully.",
            data: book,
        });

    } catch (err) {
        res.status(500).json({msg: `Something went wrong. Please try again later`});
    }
};
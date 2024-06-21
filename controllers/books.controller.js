const { Op } = require("sequelize");
const db = require("../models/index.js");
const Livro = db.livro;
const Autor = db.autor;
const Categoria = db.categoria;
const Utilizador = db.utilizador;
const CriticaLivro = db.criticaLivro;

exports.findAllBooks = async (req, res) => {
    const { title, year, author, genre } = req.query;
    
    try {
        let books;

        const whereOptions = {};

        if (year) {
            whereOptions.anoLivro = year;
        }

        if (author) {
            whereOptions['$autors.nomeAutor$'] = { [Op.like]: `%${author}%` };
        }

        if (genre) {
            whereOptions['$categoria.nomeCategoria$'] = { [Op.like]: `%${genre}%` };
        }

        if (title) {
            whereOptions.nomeLivro = { [Op.like]: `%${title}%` };
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
                    attributes: ['nomeCategoria'],
                    through: { attributes: [] }
                } 
            ],
            raw: true,
        });

        books = books.map(book => {
            book.authors = books
                .filter(b => b.idLivro === book.idLivro)
                .map(b => b['autors.nomeAutor']);

            book.genres = books
                .filter(b => b.idLivro === book.idLivro)
                .map(b => b['categoria.nomeCategoria']);

            book.authors = Array.from(new Set(book.authors));
            book.genres = Array.from(new Set(book.genres));

            return book;
        });

        const catalogueIds = new Set();
        const catalogue = [];

        for (const book of books) {
            if (!catalogueIds.has(book.idLivro)) {
                catalogueIds.add(book.idLivro);
                catalogue.push(book);
            }
        }

        return res.status(200).json({
            msg: "Books retrieved successfully.",
            data: catalogue
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({msg: "Something went wrong. Please try again later."});
    }
};

// Retrieve a single book
exports.findOne = async (req, res) => {
    try {
        let book = await Livro.findByPk(req.params.bookId, {
            include: [
                { 
                    model: Autor, 
                    as: 'autors', 
                    attributes: ['nomeAutor']
                }, 
                { 
                    model: Categoria, 
                    as: 'categoria', 
                    attributes: ['nomeCategoria'] 
                }
            ]
        });

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

exports.deleteBookById = async (req, res) => {
    const { bookId } = req.params;

    try {
        const book = await Livro.findByPk(bookId);

        if (!book) {
            return res.status(404).json({ msg: "Book not found" });
        }

        await book.destroy();
        return res.status(204).json({});
    } catch (error) {
        return res.status(500).json({ msg: "Something went wrong. Please try again later." });
    }
};

exports.getHighestRatedBook = async (req, res) => {
    try {
        const books = await Livro.findAll({
            include: [{
                model: CriticaLivro,
                attributes: ['classificacao']
            },
            { 
                model: Autor, 
                as: 'autors', 
                attributes: ['nomeAutor']
            }, 
            { 
                model: Categoria, 
                as: 'categoria', 
                attributes: ['nomeCategoria'] 
            }]
        });

        if (!books || books.length === 0) {
            return res.status(404).json({ msg: 'No books found' });
        }

        let highestAverageRatingBook = null;
        let highestAverageRating = 0;

        books.forEach(book => {
            const reviews = book.criticaLivros; 

            if (reviews && reviews.length > 0) {
                const totalRating = reviews.reduce((total, review) => {
                    const rating = parseFloat(review.classificacao);
                    return isNaN(rating) ? total : total + rating;
                }, 0);

                let averageRating = totalRating / reviews.length;

                if (averageRating > highestAverageRating) {
                    highestAverageRating = averageRating;
                    highestAverageRatingBook = {
                        title: book.nomeLivro,
                        cover: book.capaLivro,
                        description: book.descricaoLivro,
                        year: book.anoLivro,
                        averageRating: averageRating.toFixed(1),
                        authors: book.autors.map(author => author.nomeAutor).join(', '),
                        categories: book.categoria.map(category => category.nomeCategoria),
                    };
                }
            }
        });

        if (!highestAverageRatingBook) {
            return res.status(404).json({ msg: 'Highest average rated book not found' });
        }

        return res.status(200).json({ 
            msg: 'Highest rated book retrieved successfully',
            data: highestAverageRatingBook 
        });
    } catch (err) {
        console.error('Error fetching highest rated book:', err);
        return res.status(500).json({ msg: 'Something went wrong. Please try again later.' });
    }
};
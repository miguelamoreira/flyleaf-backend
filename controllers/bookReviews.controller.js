const { Op } = require("sequelize");
const db = require("../models/index.js");
const Livro = db.livro;
const Leitura = db.leitura;
const CriticaLivro = db.criticaLivro;
const Utilizador = db.utilizador;

exports.findAllReviewsByBookId = async (req, res) => {
    const bookId = req.params.bookId;

    try {
        const reviews = await CriticaLivro.findAll({
            where: { idLivro: bookId },
            include: [
                { model: Utilizador, attributes: ['idUtilizador', 'nomeUtilizador'] },
                { model: Leitura, attributes: ['dataLeitura'] }
            ]
        });

        if (reviews.length === 0) {
            return res.status(404).json({ message: "No reviews were found." });
        }

        const response = reviews.map(review => ({
            reviewId: review.idCritica,
            readingId: review.idLeitura,
            userId: review.idUtilizador,
            review: review.comentario,
            rating: review.classificacao
        }));

        res.status(200).json({ reviews: response, message: "Reviews retrieved successfully." });
    } catch (error) {
        console.error("Error fetching reviews: ", error);
        res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};

exports.createReviewOrReading = async (req, res) => {
    const { idLivro, idUtilizador, comentario, classificacao } = req.body;

    try {
        if (!comentario && !classificacao) {
            const reading = await Leitura.create({ 
                idLivro: idLivro,
                idUtilizador: idUtilizador,
                dataLeitura: new Date().toISOString().split('T')[0]
            });
            return res.status(201).json({ 
                leitura: reading, 
                message: "Reading instance created successfully." 
            });
        } else {
            const reading = await Leitura.create({ 
                idLivro: idLivro,
                idUtilizador: idUtilizador,
                dataLeitura: new Date().toISOString().split('T')[0]
            });

            const review = await CriticaLivro.create({ 
                idLivro: idLivro,
                idUtilizador: idUtilizador, 
                comentario: comentario, 
                classificacao: classificacao,
                dataLeitura: reading.dataLeitura
            });

            return res.status(201).json({
                review: review, 
                message: "Review created successfully." 
            });
        }
    } catch (error) {
        console.error("Error creating review or reading: ", error);
        return res.status(500).json({ 
            message: "Something went wrong. Please try again later." 
        });
    }
};


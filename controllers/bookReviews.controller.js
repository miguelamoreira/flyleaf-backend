const { Op } = require("sequelize");
const db = require("../models/index.js");
const Livro = db.livro;
const Leitura = db.leitura;
const CriticaLivro = db.criticaLivro;
const Utilizador = db.utilizador;

exports.findAllReviewsByBookId = async (req, res) => {
    const bookId = req.params.bookId;

    let book = await Utilizador.findByPk(bookId);
    if (!book) {
        return res.status(404).json({ msg: 'Book not found' });
    }

    try {
        const reviews = await CriticaLivro.findAll({
            where: { idLivro: bookId },
            include: [
                { model: Utilizador, attributes: ['idUtilizador', 'nomeUtilizador', 'avatarUtilizador'] },
                { model: Leitura, attributes: ['dataLeitura'] }
            ]
        });

        const response = reviews.map(review => ({
            idLivro: review.idLivro,
            idCritica: review.idCritica,
            idLeitura: review.idLeitura,
            idUtilizador: review.idUtilizador,
            nomeUtilizador: review.Utilizador.nomeUtilizador,
            avatarUtilizador: review.Utilizador.avatarUtilizador,
            comentario: review.comentario,
            classificacao: review.classificacao
        }));

        res.status(200).json({ data: response, msg: "Reviews retrieved successfully." });
    } catch (error) {
        console.error("Error fetching reviews: ", error);
        res.status(500).json({ msg: "Something went wrong. Please try again later." });
    }
};

exports.createReviewOrReading = async (req, res) => {
    const { idLivro, idUtilizador, comentario, classificacao } = req.body;

    let book = await Utilizador.findByPk(idLivro);
    if (!book) {
        return res.status(404).json({ msg: 'Book not found' });
    }

    try {
        if (!comentario && !classificacao) {
            const reading = await Leitura.create({ 
                idLivro: idLivro,
                idUtilizador: idUtilizador,
                dataLeitura: new Date().toISOString().split('T')[0]
            });
            return res.status(201).json({ 
                data: reading, 
                msg: "Reading entry created successfully." 
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
                data: review, 
                msg: "Review created successfully." 
            });
        }
    } catch (error) {
        console.error("Error creating review or reading: ", error);
        return res.status(500).json({ 
            msg: "Something went wrong. Please try again later." 
        });
    }
};

exports.updateReview = async (req, res) => {
    const reviewId = req.params.reviewId;
    const { comentario, classificacao } = req.body;

    try {
        let book = await Utilizador.findByPk(req.params.bookId);
        if (!book) {
            return res.status(404).json({ msg: 'Book not found' });
        }

        const review = await CriticaLivro.findByPk(reviewId);
        if (!review) {
            return res.status(404).json({ msg: "Review not found." });
        }

        await review.update({
            comentario: comentario || review.comentario,
            classificacao: classificacao || review.classificacao
        });

        return res.status(200).json({ msg: "Review updated successfully." });
    } catch (error) {
        return res.status(500).json({ msg: "Something went wrong. Please try again later." });
    }
};

exports.deleteReview = async (req, res) => {
    const reviewId = req.params.reviewId;

    try {
        let book = await Utilizador.findByPk(req.params.bookId);
        if (!book) {
            return res.status(404).json({ msg: 'Book not found' });
        }

        const review = await CriticaLivro.findByPk(reviewId);
        if (!review) {
            return res.status(404).json({ msg: "Review not found." });
        }

        await review.destroy();

        return res.status(204).send(); 
    } catch (error) {
        return res.status(500).json({ msg: "Something went wrong. Please try again later." });
    }
};


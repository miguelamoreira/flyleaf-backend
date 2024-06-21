const { Op } = require("sequelize");
const db = require("../models/index.js");
const Livro = db.livro;
const listaLeitura = db.listaLeitura;
const Autor = db.autor;
const Categoria = db.categoria;

// Retrieve all lists
exports.findAllLists = async (req, res) => {
    try {
        const lists = await listaLeitura.findAll({
            include: [
                { model: Livro, include: [Autor, Categoria] }
            ]
        });

        if (!lists) {
            return res.status(404).json({msg: "No reading lists were found."});
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

exports.findListById = async (req, res) => {
    try {
        const readingListId = req.params.readingListId; 

        const list = await listaLeitura.findByPk(readingListId, {
            include: [
                { model: Livro, include: [Autor, Categoria] }
            ]
        });

        if (!list) {
            return res.status(404).json({ msg: "Reading list not found." });
        }

        return res.status(200).json({
            msg: "Reading list retrieved successfully.",
            data: list
        });
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};

exports.deleteList = async (req, res) => {
    try {
        const { readingListId } = req.params; 

        const list = await listaLeitura.findByPk(readingListId);

        if (!list) {
            return res.status(404).json({ msg: "Reading list not found." });
        }

        await list.destroy();

        return res.status(204).json({});
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};

exports.createList = async (req, res) => {
    try {
        const { userId, name, state, description, newBooks } = req.body;

        const existingList = await listaLeitura.findOne({
            where: {
                idUtilizador: userId,
                nomeLista: name,
            }
        });

        if (existingList) {
            return res.status(400).json({ msg: "A reading list with the same name already exists for this user." });
        }

        if (!newBooks || newBooks.length === 0) {
            return res.status(400).json({ msg: "A reading list must have at least one book." });
        }

        const newList = await listaLeitura.create({
            idUtilizador: userId,
            nomeLista: name,
            estadoLista: state,
            descricaoLista: description
        });

        await newList.addLivros(newBooks);

        return res.status(201).json({
            msg: "Reading list created successfully",
            data: newList
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};

exports.editList = async (req, res) => {
    try {
        const readingListId = req.params.readingListId;
        const { userId, name, state, description, newBooks } = req.body;

        const existingList = await listaLeitura.findOne({
            where: {
                idUtilizador: userId,
                nomeLista: name,
                idLista: { [Op.not]: readingListId }
            }
        });

        if (existingList) {
            return res.status(400).json({ msg: "A reading list with the same name already exists for this user." });
        }

        const list = await listaLeitura.findByPk(readingListId, {
            include: [ { model: Livro, include: [Autor] } ]
        });

        if (!list) {
            return res.status(404).json({ msg: "Reading list not found." });
        }

        if (!newBooks || newBooks.length === 0) {
            return res.status(400).json({ msg: "A reading list must have at least one book." });
        }

        list.idUtilizador = userId || list.idUtilizador;
        list.nomeLista = name || list.nomeLista;
        list.estadoLista = state;
        list.descricaoLista = description || list.descricaoLista;

        await list.save();

        if (newBooks && newBooks.length > 0) {
            const books = await Livro.findAll({
                where: {
                    idLivro: {
                        [Op.in]: newBooks
                    }
                },
                include: [Autor]
            });

            if (books.length !== newBooks.length) {
                return res.status(400).json({ msg: "One or more books do not exist." });
            }

            await list.setLivros(books);
        }

        return res.status(200).json({
            msg: "Reading list updated successfully",
            data: list
        });
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};
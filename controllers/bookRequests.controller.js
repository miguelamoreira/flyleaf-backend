const db = require("../models/index.js");
const { ValidationError } = require('sequelize');
const PedidoNovoLivro = db.pedidoNovoLivro;
const Livro = db.livro;
const Autor = db.autor;
const Categoria = db.categoria;

exports.findAllRequests = async (req, res) => {
    try {   
        let requests = await PedidoNovoLivro.findAll({
            include: [
                { model: Autor, as: 'autores' },
                { model: Categoria, as: 'categorias'}
            ],
            raw: true
        });

        requests.forEach(request => {
            request.links = [
                { rel: 'delete', href: `/requests/${request.idPedidoLivro}`, method: 'DELETE'},
                { rel: 'update', href: `/requests/${request.idPedidoLivro}`, method: 'PATCH'},
            ]
        });

        return res.status(200).json({
            data: requests,
            links: [
                { rel: 'add-request', href: '/requests', method: 'POST' }
            ]
        });

    } catch (err) {
        res.status(500).json({
            msg: err.message || "Something went wrong. Please try again later."
        })
    }
};

// Controller function to create a new book request associated with the logged-in request
exports.createRequest = async (req, res) => {
    try {
        const requestId = req.requestId;

        // Check if the book already exists
        const existingBook = await Livro.findOne({
            where: { nomeLivro: req.body.nomePedidoLivro },
            include: [{
                model: Autor,
                as: 'autores',
                where: { nomeAutor: req.body.autorPedidoLivro }
            }]
        });
        
        if (existingBook) {
            return res.status(400).json({ msg: 'Book already registered' });
        }

        const author = await Autor.findOne({ where: { nomeAutor: req.body.autorPedidoLivro } });
        const category = await Categoria.findByPk(req.body.idCategoria);

        const idUtilizador = req.userId; 

        req.body.idPedidoNovoLivro = requestId;

        req.body.idUtilizador = req.body.idUtilizador || idUtilizador;
        req.body.idTipoUtilizador = req.body.idTipoUtilizador || 1;

        let newRequest = await PedidoNovoLivro.create({
            nomePedidoLivro: req.body.nomePedidoLivro,
            anoPedidoLivro: req.body.anoPedidoLivro,
            descricaoPedidoLivro: req.body.descricaoPedidoLivro,
            capaLivroPedido: req.body.capaLivroPedido,
            estadoPedido: 'validating',
            idPedidoNovoLivro: requestId, 
            idUtilizador: idUtilizador,
            Autor: author,
            Categoria: category
        });

        res.status(201).json({
            msg: "Book request successfully created.",
            data: newRequest,
            links: [
                { rel: "delete", href: `/requests/${newRequest.idPedidoLivro}`, method: "DELETE" },
                { rel: "update", href: `/requests/${newRequest.idPedidoLivro}`, method: "PATCH" },
            ]
        });

    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(400).json({ msg: err.errors.map(e => e.message) });
        } else {
            res.status(500).json({
                msg: err.message || "Something went wrong. Please try again later."
            });
        }
    }
};

exports.updateRequestState = async (req, res) => {
    try {
        let request = await PedidoNovoLivro.findByPk(req.params.requestId, {
            include: [
                { model: Autor, as: 'autores' }, 
                { model: Categoria, as: 'categorias', attributes: ['idCategoria', 'nomeCategoria'] }
            ]
        });

        if (!request) {
            return res.status(404).json({
                msg: `Cannot find any book request with ID ${req.params.requestId}`
            });
        }

        const validStates = ['validating', 'accepted', 'denied'];
        const requestedState = req.body.estadoPedido;

        if (!validStates.includes(requestedState)) {
            return res.status(400).json({
                msg: `Invalid book request state: ${requestedState}`
            });
        }

        request.estadoPedido = requestedState;

        await request.save();

        if (requestedState === 'accepted') {
            let author = await Autor.findOne({ where: { nomeAutor: request.autores[0].nomeAutor } });

            if (!author) {
                author = await Autor.create({ nomeAutor: request.autores[0].nomeAutor });
            }

            let category = request.categorias[0];
            if (!category) {
                return res.status(400).json({
                    msg: "Category not provided or invalid."
                });
            }

            console.log('Category:', category.toJSON());

            const newBook = await Livro.create({
                nomeLivro: request.nomePedidoLivro,
                anoLivro: request.anoPedidoLivro,
                descricao: request.descricaoPedidoLivro,
                capaLivro: request.capaLivroPedido
            });

            console.log('New Book:', newBook.toJSON()); 

            await newBook.setAutor(author);

            await newBook.addCategoria(category);

            return res.status(200).json({
                msg: `State for book request with ID ${req.params.requestId} successfully updated to ${requestedState}! Book added to database.`,
                data: newBook
            });
        }

        return res.status(200).json({
            msg: `State for book request with ID ${req.params.requestId} successfully updated to ${requestedState}!`,
            data: request
        });
    } catch (err) {
        console.error(err); 
        res.status(500).json({
            msg: `Something went wrong. Please try again later`
        });
    }
};

exports.deleteRequest = async (req, res) => {
    try {
        let result = await PedidoNovoLivro.destroy({ where: { idPedidoLivro: req.params.requestId } });
        
        if (result === 1) 
            return res.status(200).json({
                msg: `Book request with ID ${req.params.requestId} was successfully deleted!`
            });

        return res.status(404).json({
            msg: `Cannot find any book request with ID ${req.params.requestId}.`
        });

    } catch (err) {
        res.status(500).json({
            msg: `Something went wrong. Please try again later`
        });
    }
};
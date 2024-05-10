const db = require("../models/index.js");
const PedidoNovoLivro = db.pedidoNovoLivro;
const Livro = db.livro;

exports.findAllRequests = async (req, res) => {
    try {   
        let requests = await PedidoNovoLivro.findAll({ raw: true });

        requests.forEach(request => {
            request.links = [
                { rel: 'delete', href: `/requests/${request.idPedidoLivro}`, method: 'DELETE'},
                { rel: 'update', href: `/requests/${request.idPedidoLivro}`, method: 'PATCH'},
            ]
        })

        return res.status(200).json({
            data: requests,
            links: [
                { rel: 'add-request', href: '/requests', method: 'POST' }
            ]
        })

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
            where: { nomeLivro: req.body.nomePedidoLivro }, // Only check for the book name
            include: [{
                model: Autor,
                where: { nomeAutor: req.body.autorPedidoLivro } // Check for the author's name
            }]
        });
        
        if (existingBook) {
            return res.status(400).json({ msg: 'Book already registered' });
        }

        // Add request ID to the request body
        req.body.idPedidoNovoLivro = requestId;

        // Create a new book request associated with the logged-in request
        let newRequest = await PedidoNovoLivro.create({
            nomePedidoLivro: req.body.nomePedidoLivro,
            anoPedidoLivro: req.body.anoPedidoLivro,
            descricaoPedidoLivro: req.body.descricaoPedidoLivro,
            capaLivroPedido: req.body.capaLivroPedido,
            estadoPedido: 'validating',
            idPedidoNovoLivro: requestId // Associate request with logged-in request
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
        // Find the book request by its ID
        let request = await PedidoNovoLivro.findByPk(req.params.requestId);

        if (!request) {
            return res.status(404).json({
                msg: `Cannot find any book request with ID ${req.params.requestId}`
            });
        }

        // Ensure the requested state is one of the valid options
        const validStates = ['validating', 'accepted', 'denied'];
        const requestedState = req.body.estadoPedido;

        if (!validStates.includes(requestedState)) {
            return res.status(400).json({
                msg: `Invalid book request state: ${requestedState}`
            });
        }

        // Update the state of the book request
        request.estadoPedido = requestedState;

        // Save the updated book request
        await request.save();

        return res.status(200).json({
            msg: `State for book request with ID ${req.params.requestId} successfully updated to ${requestedState}!`,
            data: request
        });
    } catch (err) {
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
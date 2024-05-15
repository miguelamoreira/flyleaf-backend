const db = require("../models/index.js");
const { ValidationError } = require('sequelize');
const PedidoNovoLivro = db.pedidoNovoLivro;
const Livro = db.livro;
const Autor = db.autor;
const Categoria = db.categoria;
const Utilizador = db.utilizador;

exports.findAllRequests = async (req, res) => {
    try {   
        let requests = await PedidoNovoLivro.findAll({
            include: [
                { model: Autor, as: 'autors' },
                { model: Categoria, as: 'categoria'},
                { model: Utilizador, as: 'Utilizador', attributes: ['nomeUtilizador'] }
            ],
            raw: true
        });

        requests.forEach(request => {
            request.links = [
                { rel: 'delete', href: `/requests/${request.idPedido}`, method: 'DELETE'},
                { rel: 'update', href: `/requests/${request.idPedido}`, method: 'PATCH'},
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

exports.createRequest = async (req, res) => {
    try {
        const { idUtilizador, bookData, authorNames, categoryIds } = req.body;

        const existingBook = await Livro.findOne({
            where: {
                nomeLivro: bookData.nomePedidoLivro,
                anoLivro: bookData.anoPedidoLivro
            }
        });

        if (existingBook) {
            return res.status(400).json({ error: 'Book already exists in the database' });
        }

        const bookRequest = await PedidoNovoLivro.create({
            nomeLivroPedido: bookData.nomePedidoLivro,
            anoLivroPedido: bookData.anoPedidoLivro,
            descricaoLivroPedido: bookData.descricaoPedidoLivro,
            capaLivroPedido: bookData.capaLivroPedido,
            estadoPedido: bookData.estadoPedido,
            idUtilizador: idUtilizador,
        });

        const authorIds = [];
        for (const authorName of authorNames) {
            let author = await Autor.findOne({ where: { nomeAutor: authorName } });

            if (!author) {
                author = await Autor.create({ nomeAutor: authorName });
            }

            authorIds.push(author.idAutor);
        }

        await bookRequest.setAutors(authorIds);

        await bookRequest.setCategoria(categoryIds);

        res.status(201).json({ message: 'Book request created successfully', bookRequest });
    } catch (error) {
        console.error('Error creating book request:', error);
        res.status(500).json({ error: 'Failed to create book request' });
    }
};

exports.updateRequestState = async (req, res) => {
    try {
        let request = await PedidoNovoLivro.findByPk(req.params.requestId, {
            include: [
                { model: Autor, as: 'autors' }, 
                { model: Categoria, as: 'categoria', attributes: ['idCategoria', 'nomeCategoria'] }
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
            let author = await Autor.findOne({ where: { nomeAutor: request.autors[0].nomeAutor } });

            if (!author) {
                author = await Autor.create({ nomeAutor: request.autors[0].nomeAutor });
            }

            let category = request.categoria;

            if (!category) {
                return res.status(400).json({
                    msg: "Category not provided or invalid."
                });
            }

            // Validate book data before creating
            if (!request.nomeLivroPedido || !request.anoLivroPedido || !request.descricaoLivroPedido) {
                return res.status(400).json({
                    msg: "Book name, year, and description are required."
                });
            }

            const newBook = await Livro.create({
                nomeLivro: request.nomeLivroPedido,
                anoLivro: request.anoLivroPedido,
                descricaoLivro: request.descricaoLivroPedido,
                capaLivro: request.capaLivroPedido
            });

            console.log('New Book:', newBook.toJSON()); 

            await newBook.setAutors(author);

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
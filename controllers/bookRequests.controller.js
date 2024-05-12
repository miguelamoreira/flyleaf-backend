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
                { model: Autor, as: 'autores' },
                { model: Categoria, as: 'categorias'},
                { model: Utilizador, as: 'utilizador', attributes: ['idUtilizador', 'nomeUtilizador'] }
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

// Controller function to create a new book request
exports.createRequest = async (req, res) => {
    try {
        // Extract request body data
        const { idUtilizador, bookData, authorNames, categoryIds } = req.body;

        // Check if the book already exists
        const existingBook = await db.livro.findOne({
            where: {
                nomeLivro: bookData.nomePedidoLivro,
                anoLivro: bookData.anoPedidoLivro
            }
        });

        if (existingBook) {
            return res.status(400).json({ error: 'Book already exists in the database' });
        }

        // Create the book request
        const bookRequest = await db.pedidoNovoLivro.create({
            nomePedidoLivro: bookData.nomePedidoLivro,
            anoPedidoLivro: bookData.anoPedidoLivro,
            descricaoPedidoLivro: bookData.descricaoPedidoLivro,
            capaLivroPedido: bookData.capaLivroPedido,
            estadoPedido: bookData.estadoPedido,
            // Associate with user
            idUtilizador: idUtilizador,
        });

        // Check if authors already exist or create new ones
        const authorIds = [];
        for (const authorName of authorNames) {
            let author = await db.autor.findOne({ where: { nomeAutor: authorName } });

            // If author doesn't exist, calculate the next available ID
            if (!author) {
                const authorCount = await db.autor.count();
                const nextAuthorId = authorCount + 1;
                author = await db.autor.create({ idAutor: nextAuthorId, nomeAutor: authorName });
            }

            authorIds.push(author.idAutor);
        }

        // Associate authors with the book request
        await bookRequest.setAutores(authorIds);

        // Associate categories with the book request
        await bookRequest.setCategorias(categoryIds);

        // Send success response
        res.status(201).json({ message: 'Book request created successfully', bookRequest });
    } catch (error) {
        // Handle error
        console.error('Error creating book request:', error);
        res.status(500).json({ error: 'Failed to create book request' });
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
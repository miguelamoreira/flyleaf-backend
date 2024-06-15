const db = require("../models/index.js");
const { ValidationError } = require('sequelize');
const PedidoNovoLivro = db.pedidoNovoLivro;
const Livro = db.livro;
const Autor = db.autor;
const Categoria = db.categoria;
const Utilizador = db.utilizador;
const Notificacao = db.notificacao;
const cloudinary = require("cloudinary").v2;

exports.findAllRequests = async (req, res) => {
    try {   
        let requests = await PedidoNovoLivro.findAll({
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
                },
                { model: Utilizador, as: 'Utilizador', attributes: ['nomeUtilizador'] }
            ],
            raw: true
        });

        requests = requests.map(request => {
            request.authors = requests
                .filter(b => b.idPedido === request.idPedido)
                .map(b => b['autors.nomeAutor']);

            request.genres = requests
                .filter(b => b.idPedido === request.idPedido)
                .map(b => b['categoria.nomeCategoria']);

            request.authors = Array.from(new Set(request.authors));
            request.genres = Array.from(new Set(request.genres));

            request.links = [
                { rel: 'update', href: `/requests/${request.idPedido}`, method: 'PATCH'},
            ]
            
            return request;
        });

        const requestsIds = new Set();
        const requestsData = [];

        for (const request of requests) {
            if (!requestsIds.has(request.idPedido)) {
                requestsIds.add(request.idPedido);
                requestsData.push(request);
            }
        }

        return res.status(200).json({
            data: requestsData,
            msg: "Book requests retrieved successfully"
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
        console.log('req.file:', req.file);

        if (!bookData.title || !bookData.year || !bookData.description) {
            return res.status(400).json({ msg: 'The data given is incorrect and/or some parameters are missing.'} )
        }

        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const coverFile = req.file

        const b64 = Buffer.from(coverFile.buffer).toString("base64");
        let dataURI = "data:" + coverFile.mimetype + ";base64," + b64;

        const uploadResult = await cloudinary.uploader.upload(dataURI, {
            folder: 'flyleaf', 
            resource_type: 'auto', 
        });

        const existingBook = await Livro.findOne({
            where: {
                nomeLivro: bookData.title,
                anoLivro: bookData.year
            }
        });

        if (existingBook) {
            return res.status(409).json({ msg: 'The suggested book already exists in the catalogue' });
        }

        const bookRequest = await PedidoNovoLivro.create({
            nomeLivroPedido: bookData.title,
            anoLivroPedido: bookData.year,
            descricaoLivroPedido: bookData.description,
            capaLivroPedido: uploadResult.url,
            estadoPedido: bookData.state,
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
                msg: "Book request not found"
            });
        }

        const validStates = ['validating', 'accepted', 'denied'];
        const requestedState = req.body.estadoPedido;

        if (!validStates.includes(requestedState)) {
            return res.status(400).json({
                msg: "Invalid book request state"
            });
        }

        request.estadoPedido = requestedState;

        await request.save();

        const user = request.idUtilizador;

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
            
            const newBook = await Livro.create({
                nomeLivro: request.nomeLivroPedido,
                anoLivro: request.anoLivroPedido,
                descricaoLivro: request.descricaoLivroPedido,
                capaLivro: request.capaLivroPedido
            });

            console.log('New Book:', newBook.toJSON()); 

            await newBook.setAutors(author);

            await newBook.addCategoria(category);

            const newNotification = await Notificacao.create({
                idUtilizador: user,
                idTipoNotificacao: 1, 
                tituloNotificacao: 'Book request accepted',
                conteudoNotificacao: `The book "${request.nomeLivroPedido}" has been added to the catalogue.`,
                dataNotificacao: new Date().toISOString().split('T')[0]
            });

            return res.status(200).json({
                msg: `State for book request with ID ${req.params.requestId} successfully updated to ${requestedState}!`,
                data: newBook
            });
        } 

        if (requestedState === "denied") {
            const newNotification = await Notificacao.create({
                idUtilizador: user,
                idTipoNotificacao: 1, 
                tituloNotificacao: 'Book request denied',
                conteudoNotificacao: `The book "${request.nomeLivroPedido}" hasn't been added to the catalogue.`,
                dataNotificacao: new Date().toISOString().split('T')[0]
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
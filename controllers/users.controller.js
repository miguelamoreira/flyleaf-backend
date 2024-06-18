const db = require("../models/index.js");
const jwt = require('jsonwebtoken');
const Utilizador = db.utilizador;
const Livro = db.livro;
const Autor = db.autor;
const configNotifUtilizador = db.configNotifUtilizador;
const bcrypt = require("bcryptjs");

//"Op" necessary for LIKE operator
const { Op, ValidationError } = require('sequelize');

// Login 
exports.login = async (req, res) => {
    const { emailUtilizador, passeUtilizador } = req.body;
  
    try {
        if (!emailUtilizador || !passeUtilizador) {
            return res.status(400).json({ msg: 'Please provide email and password' });
        }
      
        const user = await Utilizador.findOne({ where: { emailUtilizador } });
  
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.estadoUtilizador === 'bloqueado') {
            return res.status(403).json({ msg: 'User is blocked.' });
        }

        const check = bcrypt.compareSync(passeUtilizador.trim(), user.passeUtilizador);
        
        if (!check) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.idUtilizador, role: user.idTipoUtilizador }, 'secret', { expiresIn: '1h' });
    
        const userResponse = {
            idUtilizador: user.idUtilizador,
            nomeUtilizador: user.nomeUtilizador,
            emailUtilizador: user.emailUtilizador,
            idTipoUtilizador: user.idTipoUtilizador,
            avatarUtilizador: user.avatarUtilizador,
            estadoUtilizador: user.estadoUtilizador,
            categoriasFavoritas: user.categoriasFavoritas
        };

        res.status(200).json({ token, user: userResponse});
    } catch (error) {
        res.status(500).json({ msg: 'Something went wrong. Please try again later.' });
    }
};

// Display list of all users
exports.findAll = async (req, res) => {
    try {   
        let users = await Utilizador.findAll({attributes: ['idUtilizador', 'nomeUtilizador', 'emailUtilizador', 'estadoUtilizador', 'avatarUtilizador', 'idTipoUtilizador', 'categoriasFavoritas']});

        if (!users) {
            return res.status(404).json({ msg: 'Users not found' });
        }

        users = users.map(user => ({
            ...user.toJSON(), 
            links: [
                { rel: 'self', href: `/users/${user.idUtilizador}`, method: 'GET' },
                { rel: 'delete', href: `/users/${user.idUtilizador}`, method: 'DELETE' },
                { rel: 'modify', href: `/users/${user.idUtilizador}`, method: 'PUT' },
            ]
        }));

        return res.status(200).json({
            data: users,
            links: [
                { rel: 'add-user', href: '/users', method: 'POST' }
            ]
        })

    } catch (err) {
        res.status(500).json({
            msg: "Something went wrong. Please try again later."
        })
    }
};

// Handle user creation
exports.create = async (req, res) => {
    try {
        const existingUser = await Utilizador.findOne({ where: { emailUtilizador: req.body.emailUtilizador } }, {attributes: ['idUtilizador', 'nomeUtilizador', 'emailUtilizador', 'estadoUtilizador', 'avatarUtilizador', 'categoriasFavoritas']});
        
        if (existingUser) {
            return res.status(409).json({ msg: 'User already registed' });
        }

        if (!req.body.nomeUtilizador || !req.body.emailUtilizador || !req.body.passeUtilizador) {
            return res.status(400).json({ msg: 'Please provide username, password and email'})
        }

        const hashedPassword = bcrypt.hashSync(req.body.passeUtilizador, 10);
        console.log('Hashed Password:', hashedPassword);

        let newUser = await Utilizador.create({
            nomeUtilizador: req.body.nomeUtilizador,
            emailUtilizador: req.body.emailUtilizador,
            passeUtilizador: hashedPassword,
            estadoUtilizador: 'normal',
            avatarUtilizador: 'avatar.svg'
        });

        await configNotifUtilizador.create({
            idTipoNotificacao: 1,
            idUtilizador: newUser.idUtilizador,
            estadoNotificacao: true
        });

        await configNotifUtilizador.create({
            idTipoNotificacao: 2,
            idUtilizador: newUser.idUtilizador,
            estadoNotificacao: false
        });

        const userResponse = {
            idUtilizador: newUser.idUtilizador,
            nomeUtilizador: newUser.nomeUtilizador,
            emailUtilizador: newUser.emailUtilizador,
            idTipoUtilizador: newUser.idTipoUtilizador,
            avatarUtilizador: newUser.avatarUtilizador,
            estadoUtilizador: newUser.estadoUtilizador
        };

        res.status(201).json({
            msg: "User successfully created.",
            data: userResponse,
            links: [
                { rel: "self", href: `/users/${newUser.idUtilizador}`, method: "GET" },
                { rel: "delete", href: `/users/${newUser.idUtilizador}`, method: "DELETE" },
                { rel: "modify", href: `/users/${newUser.idUtilizador}`, method: "PUT" },
            ]
        });

    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(400).json({ msg: err.errors.map(e => e.message) });
        } else {
            res.status(500).json({
                msg: "Something went wrong. Please try again later."
            });
        }
    }
};

// Retrieve a single user
exports.findOne = async (req, res) => {
    try {
        let user = await Utilizador.findByPk(req.params.userId, {attributes: ['idUtilizador', 'nomeUtilizador', 'emailUtilizador', 'estadoUtilizador', 'avatarUtilizador', 'idTipoUtilizador', 'categoriasFavoritas']});

        if (!user) {
            return res.status(404).json({
                msg: "User not found"
            });
        }

        return res.status(200).json({
            data: user,
            links: [
                { rel: 'delete', href: `/users/${user.idUtilizador}`, method: 'DELETE' },
                { rel: 'update', href: `/users/${user.idUtilizador}`, method: 'PUT' },
            ]
        });

    } catch (err) {
        res.status(500).json({
            msg: `Something went wrong. Please try again later`
        });
    }
};

// Delete a user
exports.delete = async (req, res) => {
    try {
        let result = await Utilizador.destroy({ where: { idUtilizador: req.params.userId } });
        
        if (result === 1) 
            return res.status(204).json({});

        return res.status(404).json({ msg: "User not found" });

    } catch (err) {
        res.status(500).json({
            msg: `Something went wrong. Please try again later`
        });
    }
};

// Toggle user state
exports.toggleState = async (req, res) => {
    try {
        let user = await Utilizador.findByPk(req.params.userId);

        if (!user) {
            return res.status(404).json({
                msg: "User not found"
            });
        }
        
        if (!req.body.estadoUtilizador) {
            return res.status(400).json({ msg: 'Please provide the new state' });
        }

        user.estadoUtilizador = user.estadoUtilizador === 'normal' ? 'bloqueado' : 'normal';

        await user.save();

        return res.status(200).json({
            msg: "User's state updated successfully",
        });
    } catch (err) {
        res.status(500).json({
            msg: `Something went wrong. Please try again later`
        });
    }
};

// Update user's data
exports.update = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ msg: "Please provide some data." });
        }

        let user = await Utilizador.findByPk(req.params.userId);
        if (!user) {
            return res.status(404).json({ msg: `User not found` });
        }

        user.nomeUtilizador = username;
        user.emailUtilizador = email;

        if (password && confirmPassword && password === confirmPassword) {
            user.passeUtilizador = bcrypt.hashSync(password, 10);;
        }

        await user.save();

        return res.status(200).json({ msg: `User data updated successfully` });
    } catch (err) {
        return res.status(500).json({ msg: "Something went wrong. Please try again later" });
    }
};

exports.updateAvatar = async (req, res) => {
    try {
        let user = await Utilizador.findByPk(req.params.userId);

        if (!user) {
            return res.status(404).json({
                msg: "User not found"
            });
        }

        if (!req.body.avatarUtilizador) {
            return res.status(400).json({ msg: "Please provide an avatar."})
        }

        user.avatarUtilizador = req.body.avatarUtilizador;

        await user.save();
        return res.status(200).json({ msg: `User's avatar updated successfully.` });
    } catch (error) {
        return res.status(500).json({ msg: "Something went wrong. Please try again later" });
    }
};

exports.findAllFavouritesByUserId = async (req, res) => {
    try {
        let user = await Utilizador.findByPk(req.params.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const favouriteBooks = await user.getLivros({ include: [{ model: Autor, as: 'autors' }]});

        return res.status(200).json({ data: favouriteBooks, msg: 'Favourite books retrieved successfully.'  });
    } catch (error) {
        return res.status(500).json({ msg: "Something went wrong. Please try again later" });
    }
}

exports.addFavourites = async (req, res) => {
    try {
        let user = await Utilizador.findByPk(req.params.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const book = await Livro.findByPk(req.body.idLivro);
        if (!book) {
            return res.status(404).json({ msg: 'Book not found' });
        }

        const favouriteBooks = await user.getLivros();
        if (favouriteBooks.length >= 4) {
            return res.status(400).json({ msg: 'A user can only have up to 4 favourite books.' });
        }

        const isAlreadyFavourite = favouriteBooks.some(favBook => favBook.idLivro === book.idLivro);
        if (isAlreadyFavourite) {
            return res.status(400).json({ msg: 'Book is already marked as favourite.' });
        }

        await user.addLivro(book);

        return res.status(201).json({ msg: 'Book added to favourites successfully.' });
    } catch (error) {
        return res.status(500).json({ msg: "Something went wrong. Please try again later" });
    }
};

exports.deleteFavourite = async (req, res) => {
    try {
        let user = await Utilizador.findByPk(req.params.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const book = await Livro.findByPk(req.body.idLivro);
        if (!book) {
            return res.status(404).json({ msg: 'Book not found' });
        }

        const favouriteBooks = await user.getLivros();
        const isFavourite = favouriteBooks.some(favBook => favBook.idLivro === book.idLivro);
        if (!isFavourite) {
            return res.status(400).json({ msg: 'Book is not marked as favourite.' });
        }

        await user.removeLivro(book);

        return res.status(200).json({ msg: 'Book removed from favourites successfully.' });
    } catch (error) {
        return res.status(500).json({ msg: "Something went wrong. Please try again later" });
    }
};

exports.updateFavourites = async (req, res) => {
    try {
        let user = await Utilizador.findByPk(req.params.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const oldFav = await Livro.findByPk(req.body.oldFavId);
        if (!oldFav) {
            return res.status(404).json({ msg: 'Book not found' });
        }

        const newFav = await Livro.findByPk(req.body.newFavId);
        if (!newFav) {
            return res.status(404).json({ msg: 'Book not found' });
        }

        const isFavourite = await user.hasLivro(oldFav);
        if (!isFavourite) {
            return res.status(400).json({ msg: 'Book to remove is not marked as favorite.' });
        }

        await user.removeLivro(oldFav);
        await user.addLivro(newFav);

        return res.status(200).json({ msg: 'Favourite books updated successfully' });
    } catch (error) {
        return res.status(500).json({ msg: "Something went wrong. Please try again later" });
    }
};
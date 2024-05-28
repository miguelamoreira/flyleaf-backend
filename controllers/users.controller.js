const db = require("../models/index.js");
const jwt = require('jsonwebtoken');
const Utilizador = db.utilizador;
const Livro = db.livro;
const Autor = db.autor;
const bcrypt = require("bcryptjs");

//"Op" necessary for LIKE operator
const { Op, ValidationError } = require('sequelize');

const convertBinaryToBase64 = (binaryData) => {
    return Buffer.from(binaryData).toString('base64');
  };

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
            return res.status(403).json({ msg: 'User is blocked. Contact support for assistance.' });
        }

        const check = bcrypt.compareSync(passeUtilizador.trim(), user.passeUtilizador);
        
        if (!check) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.idUtilizador, role: user.idTipoUtilizador }, 'secret', { expiresIn: '1h' });
    
        res.status(200).json({ token, user: user });
    } catch (error) {
        res.status(500).json({ msg: 'Something went wrong. Please try again later.' });
    }
};

// Display list of all users
exports.findAll = async (req, res) => {
    try {   
        let users = await Utilizador.findAll({attributes: ['idUtilizador', 'nomeUtilizador', 'emailUtilizador', 'estadoUtilizador', 'avatarUtilizador', 'idTipoUtilizador']});

        users.forEach(user => {
            user.links = [
                { rel: 'self', href: `/users/${user.id}`, method: 'GET'},
                { rel: 'delete', href: `/users/${user.id}`, method: 'DELETE'},
                { rel: 'modify', href: `/users/${user.id}`, method: 'PUT'},
            ]
        })

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
        const existingUser = await Utilizador.findOne({ where: { emailUtilizador: req.body.emailUtilizador } }, {attributes: ['idUtilizador', 'nomeUtilizador', 'emailUtilizador', 'estadoUtilizador', 'avatarUtilizador']});
        
        if (existingUser) {
            return res.status(409).json({ msg: 'User already registered' });
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

        res.status(201).json({
            msg: "User successfully created.",
            data: newUser,
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
        let user = await Utilizador.findByPk(req.params.userId);

        if (!user) {
            return res.status(404).json({
                msg: `Cannot find any user with ID ${req.params.userId}`
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
            return res.status(200).json({
                msg: `User with ID ${req.params.userId} was successfully deleted!`
            });

        return res.status(404).json({
            msg: `Cannot find any user with ID ${req.params.userId}.`
        });

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
                msg: `Cannot find any user with ID ${req.params.userId}`
            });
        }

        user.estadoUtilizador = user.estadoUtilizador === 'normal' ? 'bloqueado' : 'normal';

        await user.save();

        return res.status(200).json({
            msg: `EstadoUtilizador for user with ID ${req.params.userId} successfully toggled!`,
            data: user
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

        let user = await Utilizador.findByPk(req.params.userId);
        if (!user) {
            return res.status(404).json({ msg: `User with ID ${req.params.userId} not found.` });
        }

        user.username = username;
        user.email = email;

        if (password && confirmPassword && password === confirmPassword) {
            user.password = password;
        }

        await user.save();

        return res.status(200).json({ msg: `User with ID ${req.params.userId} updated successfully.` });
    } catch (err) {
        return res.status(500).json({ msg: "Something went wrong. Please try again later" });
    }
};

exports.updateAvatar = async (req, res) => {
    try {
        let user = await Utilizador.findByPk(req.params.userId);

        if (!user) {
            return res.status(404).json({
                msg: `Cannot find any user with ID ${req.params.userId}`
            });
        }

        user.avatarUtilizador = req.body.avatarUtilizador;

        await user.save();
        return res.status(200).json({ msg: `Avatar updated successfully.` });
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

        favouriteBooks.map(book => {
            if (book.capaLivro) {
                book.capaLivro = convertBinaryToBase64(book.capaLivro);
            }
            return book;
        });

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
            return res.status(400).json({ msg: 'A user can only have up to 4 favorite books.' });
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

        const oldFav = await Livro.findByPk(req.body.oldFav);
        if (!oldFav) {
            return res.status(404).json({ msg: 'Book not found' });
        }

        const newFav = await Livro.findByPk(req.body.newFav);
        if (!newFav) {
            return res.status(404).json({ msg: 'Book not found' });
        }

        const isFavourite = await user.hasLivro(oldFav);
        if (!isFavourite) {
            return res.status(400).json({ msg: 'Book to remove is not marked as a favorite.' });
        }

        await user.removeLivro(oldFav);
        await user.addLivro(newFav);

        return res.status(200).json({ msg: 'Trade successful. Book removed and new book added to favorites.' });
    } catch (error) {
        return res.status(500).json({ msg: "Something went wrong. Please try again later" });
    }
};
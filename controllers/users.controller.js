const db = require("../models/index.js");
const jwt = require('jsonwebtoken');
const Utilizador = db.utilizador;

//"Op" necessary for LIKE operator
const { Op, ValidationError } = require('sequelize');

// Login 
exports.login = async (req, res) => {
    const { emailUtilizador, passeUtilizador } = req.body;
  
    try {
        if (!emailUtilizador || !passeUtilizador) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }
      
        const user = await Utilizador.findOne({ where: { emailUtilizador } });
  
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
  
        if (user.passeUtilizador !== passeUtilizador) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.idUtilizador }, 'secret', { expiresIn: '1h' });
    
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
  };

// Display list of all users
exports.findAll = async (req, res) => {
    try {   
        let users = await Utilizador.findAll({ raw: true });

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
            msg: err.message || "Something went wrong. Please try again later."
        })
    }
};

// Handle user creation
exports.create = async (req, res) => {
    try {
        const existingUser = await Utilizador.findOne({ where: { emailUtilizador: req.body.emailUtilizador } });
        
        if (existingUser) {
            return res.status(400).json({ msg: 'User already registed' });
        }

        let newUser = await Utilizador.create(req.body);

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
                msg: err.message || "Something went wrong. Please try again later."
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
        return res.status(500).json({ msg: err.message || "Something went wrong. Please try again later" });
    }
};
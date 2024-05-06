const db = require("../models/index.js");
const Utilizador = db.utilizador;

//"Op" necessary for LIKE operator
const { Op, ValidationError } = require('sequelize');

// Display list of all users
exports.findAll = async (req, res) => {
    let { nomeUtilizador } = req.query;

    const condition = nomeUtilizador ? { nomeUtilizador: { [Op.like]: `${nomeUtilizador}%`}} : null;

    try {   
        let users = await Utilizador.findAll({
            where: condition,
            raw: true
        })

        users.forEach(user => {
            // Add links for each user
            user.links = [
                { rel: 'self', href: `/users/${user.id}`, method: 'GET'},
                { rel: 'delete', href: `/users/${user.id}`, method: 'DELETE'},
                { rel: 'modify', href: `/users/${user.id}`, method: 'PUT'},
            ]
        })

        return res.status(200).json({
            sucess: true,
            data: users,
            links: [
                { rel: 'add-user', href: '/users', method: 'POST' }
            ]
        })

    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Some error occurred while retrieving the users."
        })
    }
};

// Handle user creation
exports.create = async (req, res) => {
    try {
        // Save user in the database
        let newUser = await Utilizador.create(req.body);

        // Return success message with ID
        res.status(201).json({
            success: true,
            msg: "User successfully created.",
            links: [
                { rel: "self", href: `/users/${newUser.id}`, method: "GET" },
                { rel: "delete", href: `/users/${newUser.id}`, method: "DELETE" },
                { rel: "modify", href: `/users/${newUser.id}`, method: "PUT" },
            ]
        });

    } catch (err) {
        if (err instanceof ValidationError)
            res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        else
            res.status(500).json({
                success: false, msg: err.message || "Some error occurred while creating the user."
            });
    };
};

// Retrieve a single user
exports.findOne = async (req, res) => {
    try {
        let user = await Utilizador.findByPk(req.params.idUser);

        if (!user) 
            return res.status(404).json({
                success: false,
                msg: `Cannot find any user with ID ${req.params.idUser}`
            });

        return res.status(200).json({
            success: true,
            data: user,
            links: [
                { rel: 'delete', href: `/users/${user.id}`, method: 'DELETE' },
                { rel: 'update', href: `/users/${user.id}`, method: 'PUT' },
            ]
        });

    } catch (err) {
        res.status(500).json({
            success: false, msg: `Error retrieving user with ID ${req.params.idUser}.`
        });
    };
};

// Update a user
exports.update = async (req, res) => {
    try {
        let user = await Utilizador.findByPk(req.params.idUser);
        
        if (!user) 
            return res.status(404).json({
                success: false, 
                msg: `Cannot find any user with ID ${req.params.idUser}`
            });

        await Utilizador.update(req.body, {
            where: { id: req.params.idUser }
        });

        return res.json({
            success: true,
            msg: `User with ID ${req.params.idUser} was updated successfully.`
        });

    } catch (err) {
        if (err instanceof ValidationError)
            res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
        else
            res.status(500).json({
                success: false, msg: err.message || "Some error occurred while updating the user."
            });
    };
};

// Delete a user
exports.delete = async (req, res) => {
    try {
        let result = await Utilizador.destroy({where: {id: req.params.idUser}});
        
        if (result === 1) 
            return res.status(200).json({
                success: true,
                msg: `User with ID ${req.params.idUser} was successfully deleted!`
            });

        return res.status(404).json({
            success: false,
            msg: `Cannot find any user with ID ${req.params.idUser}.`
        });

    } catch (err) {
        res.status(500).json({
            success: false, msg: `Error deleting user with ID ${req.params.idUser}.`
        });
    };
};

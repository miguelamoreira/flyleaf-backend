const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../models");

exports.verifyToken = (req, res, next) => {
    try {
        const header = req.headers['x-access-token'] || req.headers.authorization;

        if (typeof header == 'undefined')
            throw new ErrorHandler(401, "No token provided!");

        let token, bearer = header.split(' ');
        if (bearer.length == 2)
            token = bearer[1];
        else
            token = header;

        let decoded = jwt.verify(token, 'secret');
        req.loggedUserId = decoded.userId;
        req.loggedUserRole = decoded.role;

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError')
            err = "Your token has expired! Please login again.";

        if (err.name === 'JsonWebTokenError')
            err = "Malformed JWT! Please login again.";

        return res.status(401).json({ message: err });
    }
};

exports.isAdmin = async (req, res, next) => {
    if (req.loggedUserRole === 2) 
        return next();

    return res.status(403).json({ message: "This request requires ADMIN role!" });
};

exports.isRegularUser = async (req, res, next) => {
    if (req.loggedUserRole === 1)
        return next();

    return res.status(403).json({ message: "This request requires REGULAR USER role!" });
};

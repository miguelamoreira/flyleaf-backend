const dbConfig = require('../config/db.config.js');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect
    ,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection do DB has been established successfully.');
    } catch (err) {
        console.error('Unable to connect to the database:', err);
    }
})();

const db = {};
//export the sequelize object (DB connection)
db.sequelize = sequelize;

db.utilizador = require("./users.model.js")(sequelize, DataTypes);
db.autor = require("./authors.model.js")(sequelize, DataTypes);
db.pedidoNovoLivro = require("./bookRequests.model.js")(sequelize, DataTypes);
db.criticaLivro = require("./bookReviews.model.js")(sequelize, DataTypes);
db.livro = require("./books.model.js")(sequelize, DataTypes);
db.categoria = require("./genres.model.js")(sequelize, DataTypes);
db.notificacao = require("./notifications.model.js")(sequelize, DataTypes);
db.tipoNotificacao = require("./notificationTypes.model.js")(sequelize, DataTypes);
db.listaLeitura = require("./readingLists.model.js")(sequelize, DataTypes);
db.tipoUtilizador = require("./userTypes.model.js")(sequelize, DataTypes);



module.exports = db;

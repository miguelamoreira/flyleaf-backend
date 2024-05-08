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

// Associations
db.tipoUtilizador.hasMany(db.utilizador, { foreignKey: 'idTipoUtilizador' })
db.utilizador.belongsTo(db.tipoUtilizador, { foreignKey: 'idTipoUtilizador' });

db.utilizador.hasMany(db.criticaLivro, { foreignKey: 'idUtilizador' });
db.criticaLivro.belongsTo(db.utilizador, { foreignKey: 'idUtilizador' });

db.livro.hasMany(db.criticaLivro, { foreignKey: 'idLivro' });
db.criticaLivro.belongsTo(db.livro, { foreignKey: 'idLivro' });

db.utilizador.hasMany(db.pedidoNovoLivro, { foreignKey: 'idUtilizador' });
db.pedidoNovoLivro.belongsTo(db.utilizador, { foreignKey: 'idUtilizador' });

db.utilizador.hasMany(db.listaLeitura, { foreignKey: 'idUtilizador' });
db.listaLeitura.belongsTo(db.utilizador, { foreignKey: 'idUtilizador' });

db.utilizador.hasMany(db.notificacao, { foreignKey: 'idUtilizador' });
db.notificacao.belongsTo(db.utilizador, { foreignKey: 'idUtilizador' });

db.tipoNotificacao.hasMany(db.notificacao, { foreignKey: 'idTipoNotificacao' });
db.notificacao.belongsTo(db.tipoNotificacao, { foreignKey: 'idTipoNotificacao' });


module.exports = db;

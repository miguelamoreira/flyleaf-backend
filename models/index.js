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
db.leitura = require("./readings.model.js")(sequelize, DataTypes);
db.configNotifUtilizador = require("./userNotifConfigs.model.js")(sequelize, DataTypes);
db.tipoUtilizador = require("./userTypes.model.js")(sequelize, DataTypes);

db.autor.belongsToMany(db.livro, {
    through: 'autorLivro',
    foreignKey: 'idAutor', 
    otherKey: 'idLivro', 
    timestamps: false
});

db.livro.belongsToMany(db.autor, {
    through: 'autorLivro',
    foreignKey: 'idLivro',
    otherKey: 'idAutor',
    timestamps: false
});

db.categoria.belongsToMany(db.livro, {
    through: 'categoriaLivro',
    timestamps: false,
    foreignKey: 'idCategoria', 
    otherKey: 'idLivro' 
});

db.livro.belongsToMany(db.categoria, {
    through: 'categoriaLivro',
    timestamps: false, 
    foreignKey: 'idLivro', 
    otherKey: 'idCategoria' 
});

db.autor.belongsToMany(db.pedidoNovoLivro, {
    through: 'autorPedido', 
    foreignKey: 'idAutor', 
    otherKey: 'idPedido', 
    timestamps: false
});

db.pedidoNovoLivro.belongsToMany(db.autor, {
    through: 'autorPedido', 
    foreignKey: 'idPedido', 
    otherKey: 'idAutor', 
    timestamps: false
});

db.categoria.belongsToMany(db.pedidoNovoLivro, {
    through: 'categoriaPedido',
    foreignKey: 'idCategoria',
    otherKey: 'idPedido', 
    timestamps: false
});

db.pedidoNovoLivro.belongsToMany(db.categoria, {
    through: 'categoriaPedido',
    foreignKey: 'idPedido',
    otherKey: 'idCategoria',
    timestamps: false
});

db.utilizador.belongsToMany(db.livro, {
    through: 'favoritoUtilizador',
    foreignKey: 'idUtilizador',
    otherKey: 'idLivro',
    timestamps: false
});

db.livro.belongsToMany(db.utilizador, {
    through: 'favoritoUtilizador',
    foreignKey: 'idLivro',
    otherKey: 'idUtilizador',
    timestamps: false
});

db.listaLeitura.belongsToMany(db.livro, { 
    through: 'livroLista', 
    foreignKey: 'idLista',
    otherKey: 'idLivro', 
    timestamps: false 
});

db.livro.belongsToMany(db.listaLeitura, { 
    through: 'livroLista', 
    foreignKey: 'idLivro', 
    otherKey: 'idLista',
    timestamps: false 
});

db.utilizador.belongsToMany(db.livro, {
    through: db.leitura,
    foreignKey: 'idUtilizador', 
    otherKey: 'idLivro',
    timestamps: false 
});
db.livro.belongsToMany(db.utilizador, {
    through: db.leitura,
    foreignKey: 'idLivro', 
    otherKey: 'idUtilizador',
    timestamps: false 
});

db.utilizador.belongsToMany(db.tipoNotificacao, {
    through: db.configNotifUtilizador,
    foreignKey: 'idUtilizador', 
    otherKey: 'idTipoNotificacao',
    timestamps: false 
});

db.tipoNotificacao.belongsToMany(db.utilizador, {
    through: db.configNotifUtilizador,
    foreignKey: 'idTipoNotificacao', 
    otherKey: 'idUtilizador',
    timestamps: false 
});

db.listaLeitura.belongsTo(db.utilizador, { foreignKey: 'idUtilizador' });

db.pedidoNovoLivro.belongsTo(db.utilizador, { foreignKey: 'idUtilizador' });

module.exports = db;
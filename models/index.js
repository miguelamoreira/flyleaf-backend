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
    through: 'autorlivro',
    as: 'livros', 
    foreignKey: 'idAutor', 
    otherKey: 'idLivro', 
    timestamps: false
});

db.livro.belongsToMany(db.autor, {
    through: 'autorlivro',
    as: 'autores', 
    foreignKey: 'idLivro',
    otherKey: 'idAutor',
    timestamps: false
});

db.categoria.belongsToMany(db.livro, {
    through: 'categorialivro',
    timestamps: false,
    foreignKey: 'idCategoria', 
    otherKey: 'idLivro' 
});

db.livro.belongsToMany(db.categoria, {
    through: 'categorialivro',
    timestamps: false, 
    foreignKey: 'idLivro', 
    otherKey: 'idCategoria' 
});

db.autor.belongsToMany(db.pedidoNovoLivro, { through: 'autorpedido' });
db.pedidoNovoLivro.belongsToMany(db.autor, { through: 'autorpedido' });

db.categoria.belongsToMany(db.pedidoNovoLivro, { through: 'categoriapedido' });
db.pedidoNovoLivro.belongsToMany(db.categoria, { through: 'categoriapedido' });

db.utilizador.belongsToMany(db.livro, { through: 'favoritoutilizador' });
db.livro.belongsToMany(db.utilizador, { through: 'favoritoutilizador' });

db.listaLeitura.belongsToMany(db.livro, { 
    through: 'livrolista', 
    foreignKey: 'idLista', 
    timestamps: false 
});

db.livro.belongsToMany(db.listaLeitura, { 
    through: 'livrolista', 
    foreignKey: 'idLivro', 
    timestamps: false 
});

db.utilizador.belongsToMany(db.livro, { through: db.leitura });
db.livro.belongsToMany(db.utilizador, { through: db.leitura });

db.utilizador.belongsToMany(db.tipoNotificacao, { through: db.configNotifUtilizador });
db.tipoNotificacao.belongsToMany(db.utilizador, { through: db.configNotifUtilizador });

db.livro.hasMany(db.criticaLivro);
db.criticaLivro.belongsTo(db.livro);

db.utilizador.hasMany(db.criticaLivro);
db.criticaLivro.belongsTo(db.utilizador);

db.utilizador.hasMany(db.notificacao);
db.notificacao.belongsTo(db.utilizador);

db.utilizador.hasMany(db.pedidoNovoLivro, { foreignKey: 'idUtilizador' });
db.pedidoNovoLivro.belongsTo(db.utilizador, { foreignKey: 'idUtilizador' });

db.tipoNotificacao.hasMany(db.notificacao);
db.notificacao.belongsTo(db.tipoNotificacao);

module.exports = db;

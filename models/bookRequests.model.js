module.exports = (sequelize, DataTypes) => {
    const pedidoNovoLivro = sequelize.define("pedidonovolivro", {
        idPedidoLivro: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nomePedidoLivro: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Book request name cannot be empty or null!" }
            }
        },
        anoPedidoLivro: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            validate: {
                notNull: { msg: "Book request year cannot be empty or null!" }
            }
        },
        descricaoPedidoLivro: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Book request description cannot be empty or null!" }
            }
        },
        capaLivroPedido: {
            type: DataTypes.BLOB,
            allowNull: false,
            validate: {
                notNull: { msg: "Book request cover cannot be empty or null!" }
            }
        },
        estadoPedido: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'validating',
            validate: {
                notNull: { msg: "Book request state cannot be empty or null!" }
            }
        },
    }, {
        tableName: 'pedidonovolivro',
        timestamps: false
    });

    pedidoNovoLivro.associate = (models) => {
        pedidoNovoLivro.belongsTo(models.utilizador, { foreignKey: 'idUtilizador' });
    };

    return pedidoNovoLivro;
};

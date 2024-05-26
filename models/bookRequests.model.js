module.exports = (sequelize, DataTypes) => {
    const PedidoNovoLivro = sequelize.define("pedidoNovoLivro", {
        idPedido: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nomeLivroPedido: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Book request name cannot be empty or null!" }
            }
        },
        anoLivroPedido: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Book request year cannot be empty or null!" }
            }
        },
        descricaoLivroPedido: {
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
        tableName: 'pedidoNovoLivro',
        timestamps: false
    });

    PedidoNovoLivro.associate = (models) => {
        PedidoNovoLivro.belongsTo(models.Utilizador, { foreignKey: 'idUtilizador', onDelete: 'CASCADE' });
    };

    return PedidoNovoLivro;
};

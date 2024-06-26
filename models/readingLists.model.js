module.exports = (sequelize, DataTypes) => {
    const ListaLeitura = sequelize.define("listaLeitura", {
        idLista: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nomeLista: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "List name cannot be empty or null!" }
            }
        },
        estadoLista: {
            type: DataTypes.TINYINT,
            allowNull: false,
            validate: {
                notNull: { msg: "List state cannot be empty or null!" }
            }
        },
        descricaoLista: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "List description cannot be empty or null!" }
            }
        }
    }, {
        tableName: 'listaLeitura',
        timestamps: false
    });

    ListaLeitura.associate = (models) => {
        ListaLeitura.belongsTo(models.Utilizador, { foreignKey: 'idUtilizador' });
    };

    return ListaLeitura;
};

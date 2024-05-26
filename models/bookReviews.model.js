module.exports = (sequelize, DataTypes) => {
    const CriticaLivro = sequelize.define("criticaLivro", {
        idCritica: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        idLivro: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        comentario: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Review cannot be empty or null!" }
            }
        },
        classificacao: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Rating cannot be empty or null!" }
            }
        },
        dataLeitura: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        tableName: 'criticaLivro',
        timestamps: false
    });

    CriticaLivro.associate = (models) => {
        CriticaLivro.belongsTo(models.Livro, { foreignKey: 'idLivro'}, );
        CriticaLivro.belongsTo(models.Utilizador, { foreignKey: 'idUtilizador', onDelete: 'CASCADE'});
        CriticaLivro.belongsTo(models.leitura, { foreignKey: 'dataLeitura'});
    };

    return CriticaLivro;
};

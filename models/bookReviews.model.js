module.exports = (sequelize, DataTypes) => {
    const CriticaLivro = sequelize.define("criticaLivro", {
        idCritica: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
        }
    }, {
        tableName: 'criticaLivro',
        timestamps: false
    });

    CriticaLivro.associate = (models) => {
        CriticaLivro.belongsTo(models.Livro, { foreignKey: 'idLivro' });
        CriticaLivro.belongsTo(models.Utilizador, { foreignKey: 'idUtilizador' });
        CriticaLivro.belongsTo(models.leitura, { foreignKey: 'dataLeitura' });
    };

    return CriticaLivro;
};

module.exports = (sequelize, DataTypes) => {
    const Livro = sequelize.define("Livro", {
        idLivro: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nomeLivro: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Book name cannot be empty or null!" }
            }
        },
        anoLivro: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Year cannot be empty or null!" }
            }
        },
        descricaoLivro: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Description cannot be empty or null!" }
            }
        },
        capaLivro: {
            type: DataTypes.BLOB('long'),
            allowNull: false,
            validate: {
                notNull: { msg: "Cover cannot be empty or null!" }
            }
        }
    }, {
        tableName: 'Livro',
        timestamps: false
    });

    Livro.associate = (models) => {
        Livro.hasMany(models.criticaLivro, { foreignKey: 'idCritica' });
        Livro.hasMany(models.leitura, { foreignKey: 'idLivro' });
    };

    return Livro;
};

module.exports = (sequelize, DataTypes) => {
    const Livro = sequelize.define("livro", {
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
            unique: true,
            validate: {
                notNull: { msg: "Year cannot be empty or null!" }
            }
        },
        descricao: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Description cannot be empty or null!" }
            }
        },
        capaLivro: {
            type: DataTypes.BLOB,
            allowNull: false,
            validate: {
                notNull: { msg: "Cover cannot be empty or null!" }
            }
        }
    }, {
        tableName: 'livro',
        timestamps: false
    });

    return Livro;
};

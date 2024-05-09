module.exports = (sequelize, DataTypes) => {
    const Autor = sequelize.define("autores", {
        idAutor: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nomeAutor: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Author name cannot be empty or null!" }
            }
        }
    }, {
        tableName: 'autores',
        timestamps: false
    });

    return Autor;
};

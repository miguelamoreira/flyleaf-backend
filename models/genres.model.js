module.exports = (sequelize, DataTypes) => {
    const Categoria = sequelize.define("categoria", {
        idCategoria: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nomeCategoria: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Genre name cannot be empty or null!" }
            }
        }
    }, {
        tableName: 'categoria',
        timestamps: false
    });

    return Categoria;
};

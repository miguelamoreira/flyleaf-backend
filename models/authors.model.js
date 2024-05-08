module.exports = (sequelize, DataTypes) => {
    const Autor = sequelize.define("autor", {
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
        tableName: 'autor',
        timestamps: false
    });

    return Autor;
};

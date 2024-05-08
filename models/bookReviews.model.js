module.exports = (sequelize, DataTypes) => {
    const criticaLivro = sequelize.define("criticalivro", {
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
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Rating cannot be empty or null!" }
            }
        }
    }, {
        tableName: 'criticalivro',
        timestamps: false
    });

    return criticaLivro;
};

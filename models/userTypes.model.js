module.exports = (sequelize, DataTypes) => {
    const tipoUtilizador = sequelize.define("tipoUtilizador", {
        idTipoUtilizador: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tipoUtilizador: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "User type description cannot be empty or null!" }
            }
        }
    }, {
        tableName: 'tipoUtilizador',
        timestamps: false
    });

    return tipoUtilizador;
};

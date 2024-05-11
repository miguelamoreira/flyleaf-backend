module.exports = (sequelize, DataTypes) => {
    const tipoUtilizador = sequelize.define("tipoutilizador", {
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
        tableName: 'tipoutilizador',
        timestamps: false
    });

    tipoUtilizador.associate = (models) => {
        tipoUtilizador.hasMany(models.utilizador, { foreignKey: 'idUtilizador' });
    };

    return tipoUtilizador;
};

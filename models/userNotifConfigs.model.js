module.exports = (sequelize, DataTypes) => {
    const ConfigNotifUtilizador = sequelize.define("configNotifUtilizador", {
        idTipoNotificacao: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        idUtilizador: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        estadoNotificacao: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            validate: {
                notNull: { msg: "Notification state cannot be empty or null!" }
            }
        }
    }, {
        tableName: 'configNotifUtilizador',
        timestamps: false
    });

    ConfigNotifUtilizador.associate = (models) => {
        ConfigNotifUtilizador.belongsTo(models.tipoNotificacao, { foreignKey: 'idTipoNotificacao' });
        ConfigNotifUtilizador.belongsTo(models.Utilizador, { foreignKey: 'idUtilizador' });
    };

    return ConfigNotifUtilizador;
};
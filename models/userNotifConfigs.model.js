module.exports = (sequelize, DataTypes) => {
    const configNotifUtilizador = sequelize.define("confignotifutilizador", {
        estadoNotificacao: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            validate: {
                notNull: { msg: "Notification state cannot be empty or null!" }
            }
        }
    }, {
        tableName: 'confignotifutilizador',
        timestamps: false
    });

    return configNotifUtilizador;
};

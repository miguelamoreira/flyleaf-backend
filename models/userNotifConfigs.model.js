module.exports = (sequelize, DataTypes) => {
    const ConfigNotifUtilizador = sequelize.define("configNotifUtilizador", {
        estadoNotificacao: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Notification state cannot be empty or null!" }
            }
        }
    }, {
        tableName: 'configNotifUtilizador',
        timestamps: false
    });

    return ConfigNotifUtilizador;
};

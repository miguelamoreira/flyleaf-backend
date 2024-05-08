module.exports = (sequelize, DataTypes) => {
    const tipoNotificacao = sequelize.define("tiponotificacao", {
        idTipoNotificacao: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tipoNotificacao: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Notification type description cannot be empty or null!" }
            }
        }
    }, {
        tableName: 'tiponotificacao',
        timestamps: false
    });

    return tipoNotificacao;
};

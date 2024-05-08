module.exports = (sequelize, DataTypes) => {
    const Notificacao = sequelize.define("notificacao", {
        idNotificacao: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        conteudoNotificacao: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Notification content cannot be empty or null!" }
            }
        }
    }, {
        tableName: 'notificacao',
        timestamps: false
    });

    return Notificacao;
};

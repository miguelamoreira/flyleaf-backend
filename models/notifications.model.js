module.exports = (sequelize, DataTypes) => {
    const Notificacao = sequelize.define("Notificacao", {
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
        tableName: 'Notificacao',
        timestamps: false
    });

    Notificacao.associate = (models) => {
        Notificacao.belongsTo(models.tipoNotificacao, { foreignKey: 'idTipoNotificacao' });
        Notificacao.belongsTo(models.Utilizador, { foreignKey: 'idUtilizador' });
    };

    return Notificacao;
};

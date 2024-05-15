module.exports = (sequelize, DataTypes) => {
    const TipoNotificacao = sequelize.define("tipoNotificacao", {
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
        tableName: 'tipoNotificacao',
        timestamps: false
    });

    TipoNotificacao.associate = (models) => {
        TipoNotificacao.hasMany(models.Notificacao, { foreignKey: 'idNotificacao' });
    };


    return TipoNotificacao;
};

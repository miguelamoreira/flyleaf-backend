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
        },
        estadoNotificacao: {
            type: DataTypes.BOOLEAN,
            defaultValue: true 
        },
        dataNotificacao: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notNull: { msg: "Date cannot be empty or null!" }
            }
        },
        tituloNotificacao: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Notification title cannot be empty!" }
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

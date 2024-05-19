module.exports = (sequelize, DataTypes) => {
    const Utilizador = sequelize.define("Utilizador", {
        idUtilizador: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        idTipoUtilizador: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                notNull: { msg: "User type ID cannot be empty or null!" }
            }
        },
        nomeUtilizador: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "User name cannot be empty or null!" }
            }
        },
        emailUtilizador: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notNull: { msg: "Email cannot be empty or null!" }
            }
        },
        passeUtilizador: {
            type: DataTypes.STRING,
            trim: true,
            allowNull: false,
            validate: {
                notNull: { msg: "Password cannot be empty or null!" }
            }
        },
        estadoUtilizador: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'normal',
            validate: {
                notNull: { msg: "User state cannot be empty or null!" }
            }
        },
        avatarUtilizador: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'avatar.svg',
            validate: {
                notNull: { msg: "User avatar cannot be empty or null!"}
            }
        }
    }, {
        tableName: 'Utilizador',
        timestamps: false
    });

    Utilizador.associate = (models) => {
        Utilizador.belongsTo(models.tipoUtilizador, { foreignKey: 'idTipoUtilizador' });
        Utilizador.hasMany(models.criticaLivro, { foreignKey: 'idCritica' });
        Utilizador.hasMany(models.listaLeitura, { foreignKey: 'idLista' });
        Utilizador.hasMany(models.Notificacao, { foreignKey: 'idNotificacao' });
        Utilizador.hasMany(models.pedidoNovoLivro, { foreignKey: 'idPedido' });
    };

    return Utilizador;
};

module.exports = (sequelize, DataTypes) => {
    const Leitura = sequelize.define("leitura", {
        dataLeitura: {
            type: DataTypes.DATE,
            primaryKey: true
        },
        idUtilizador: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
              model: 'Utilizador',
              key: 'idUtilizador'
            }
        },
          idLivro: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
              model: 'Livro',
              key: 'idLivro'
            }
        }
    }, {
        tableName: 'leitura',
        timestamps: false
    });

    Leitura.associate = (models) => {
        Leitura.belongsTo(models.livro, { foreignKey: 'idLivro' });
        Leitura.hasMany(models.criticaLivro, { foreignKey: 'dataLeitura' });
    };

    return Leitura;
};

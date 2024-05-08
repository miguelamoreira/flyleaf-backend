module.exports = (sequelize, DataTypes) => {
    const Leitura = sequelize.define("leitura", {
        dataLeitura: {
            type: DataTypes.DATE,
            primaryKey: true
        }
    }, {
        tableName: 'leitura',
        timestamps: false
    });

    return Leitura;
};

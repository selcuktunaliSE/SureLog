const {Sequelize,DataTypes} = require('sequelize');


const sequelize = new Sequelize('multitenantDB','root','root',{
    host: 'localhost',
    port: '8889',
    dialect: 'mysql'
    });

const tenant = sequelize.define('tenant', {
    tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    userCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    dateCreated: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    }, {
    tableName: 'tenants',
    timestamps: true,
});
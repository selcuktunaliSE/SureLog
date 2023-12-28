const {Sequelize,DataTypes} = require('sequelize');
const sequelize = new Sequelize('multitenantDB','root','root',{
    host: 'localhost',
    port: '8889',
    dialect: 'mysql'
    });

const user = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: DataTypes.STRING,
    email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
    },
    role: DataTypes.STRING,
    tenantId: DataTypes.INTEGER
});

module.exports = user;

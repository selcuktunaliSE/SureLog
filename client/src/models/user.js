const {Sequelize,DataTypes} = require('sequelize');
const sequelize = new Sequelize('multitenantDB','root','root',{
    host: 'localhost',
    port: '3306',
    dialect: 'mysql'
    });

const user = sequelize.define('user', {
    userId: {
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

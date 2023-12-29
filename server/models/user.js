const {Sequelize,DataTypes} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const UserModel = sequelize.define('user', {
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
  
    return UserModel;
  };

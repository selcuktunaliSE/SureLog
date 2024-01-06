const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const TenantUserModel = sequelize.define('TenantUserModel', {
    tenantId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'tenant_users',
    timestamps: false
  });

  return TenantUserModel;
};
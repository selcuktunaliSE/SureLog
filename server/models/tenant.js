const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const TenantModel = sequelize.define('tenant',
    {
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
    },
    {
      tableName: 'tenants',
      timestamps: true,
    }
  );
  
    return TenantModel;
  };


const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

  const UserModel = sequelize.define('UserModel', {
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: DataTypes.STRING,
    middleName: DataTypes.STRING, // Optional
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastActivityAt: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'users',
    timestamps: false
  });

  const UserAddressModel = sequelize.define('UserAddressModel', {
    street: DataTypes.STRING,
    city: DataTypes.STRING,
    country: DataTypes.STRING,
    zipCode: DataTypes.STRING
  }, {
    tableName: 'user_addresses'
  });

  const MasterModel = sequelize.define('MasterModel', {
    masterId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      unique: true,
      allowNull: false
    }
  }, {
    tableName: 'masters'
  });

  const MasterPermissionModel = sequelize.define('MasterPermissionModel', {
    masterId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'masters',
        key: 'masterId'
      }
    },
    assignMaster: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    revokeMaster: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    addTenant: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    viewTenants: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    addMasterRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    editMasterRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deleteMasterRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    assignMasterRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    revokeMasterRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    viewAllUsers: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'master_permissions'
  });

  
  const MasterRolePermissionModel = sequelize.define('MasterRolePermissionModel', {
    masterId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'masters',
        key: 'masterId'
      }
    },
    tenantId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'tenantId'
      }
    },
    roleName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addUser: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    editUser: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    removeUserFromTenant: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deleteUser: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    editTenant: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deleteTenant: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    addTenantRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    editTenantRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deleteTenantRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    assignTenantRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    revokeTenantRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    viewTenantUsers: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'master_role_permissions'
  });

  const TenantModel = sequelize.define('TenantModel',
      {
        tenantId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: false,
        },
        userCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        }
      },
      {
        tableName: 'tenants',
        timestamps: true,
      }
    );
  
  
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
    createdAt: DataTypes.DATE,
    tenantRoleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'tenant_role_permissions',
        key: 'tenantRoleId'
      }
    }
  }, {
    tableName: 'tenant_users',
    timestamps: true
  });

  const TenantRolePermissionModel = sequelize.define('TenantRolePermissionModel', {
    tenantRoleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    tenantId: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'tenants', 
        key: 'tenantId',   
      },
      onUpdate: 'CASCADE', 
      onDelete: 'CASCADE', 
    },
    roleName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    removeUserFromTenant: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    editTenant: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    deleteTenant: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    addTenantRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    editTenantRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    deleteTenantRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    assignTenantRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    revokeTenantRole: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    viewTenantUsers: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'tenant_role_permissions'
  });


    const associate = () => {

      // Add beforeCreate and beforeUpdate hooks
      UserModel.beforeCreate((user, options) => {
        // Set createdAt and updatedAt to the current date and time
        const currentDate = new Date();
        user.createdAt = currentDate;
        user.updatedAt = currentDate;
      });

      UserModel.beforeUpdate((user, options) => {
        if (options.fields.includes('lastLoginAt') || options.fields.includes('lastActivityAt')) {
          const index = options.fields.indexOf('updatedAt');
          if (index > -1) {
            options.fields.splice(index, 1);
          }
        } else {
          user.updatedAt = new Date();
        }
      });

      TenantModel.beforeCreate((tenant, options) => {
        const currentDate = new Date();
        tenant.createdAt = currentDate;
        tenant.updatedAt = currentDate;
      });

      TenantModel.beforeUpdate((tenant, options) => {
        tenant.updatedAt = new Date();
      });

      TenantUserModel.beforeCreate((tenantUser, options) => {
        tenant.createdAt = new Date();
      })

      UserModel.hasOne(UserAddressModel, { foreignKey: 'userId' });
      UserAddressModel.belongsTo(UserModel, { foreignKey: 'userId' });

      UserAddressModel.beforeUpdate(async (address) => {
        await UserModel.update({ updatedAt: new Date() }, { where: { userId: address.userId } });
      });

      // Create a direct association between Masters and MasterRolePermissionModel
      MasterModel.hasMany(MasterRolePermissionModel, { 
        foreignKey: 'masterId',
        as: 'masterRoles' });
      MasterRolePermissionModel.belongsTo(MasterModel, {
         foreignKey: 'masterId',
         as:'master' });

      MasterModel.hasOne(MasterPermissionModel, {
        foreignKey: "masterId",
        as: 'masterPermissions'});
      MasterPermissionModel.belongsTo(MasterModel, {
        foreignKey: "masterId",
        as: 'master'});

      // Create a direct association between Master Role Permissions and Tenants
      MasterRolePermissionModel.belongsTo(TenantModel, {
         foreignKey: 'tenantId',
         as: 'tenant' });
      TenantModel.hasMany(MasterRolePermissionModel, { 
        foreignKey: 'tenantId',
        as: 'masterRoles'});

      // Create a direct association between TenantModel and TenantUserModel
      TenantModel.hasMany(TenantUserModel, { 
        foreignKey: 'tenantId',
        as: 'users' });
      TenantUserModel.belongsTo(TenantModel, { 
        foreignKey: 'tenantId',
        as: 'tenant' });
      TenantUserModel.belongsTo(UserModel, {
        foreignKey: 'userId', // The foreign key in TenantUserModel that references UserModel
        as: 'user', // Alias for the association (you can choose any name you prefer)
      });

      TenantUserModel.belongsTo(TenantRolePermissionModel, {
        foreignKey: 'tenantRoleId',
        as: 'rolePermissions'
      });
      
      TenantRolePermissionModel.hasMany(TenantUserModel, {
        foreignKey: 'tenantRoleId',
        as: 'users'
      });


      // Create a many-to-many association between Masters and TenantModel
      MasterModel.belongsToMany(TenantModel, {
        through: MasterRolePermissionModel,
        foreignKey: 'masterId', // Use 'masterId' as the foreign key in the join table
        otherKey: 'tenantId',
        as: 'tenants'   // Use 'tenantId' as the other key in the join table
      });
      TenantModel.belongsToMany(MasterModel, {
        through: MasterRolePermissionModel,
        foreignKey: 'tenantId',
        otherKey: 'userId',
        as: 'masters'
      });


      // Define the existing many-to-many associations
      UserModel.belongsTo(TenantModel, {
        through: TenantUserModel,
        foreignKey: 'userId',
        otherKey: 'tenantId',
      });
    
      TenantModel.belongsToMany(UserModel, {
        through: TenantUserModel,
        foreignKey: 'tenantId',
        otherKey: 'userId',
      });
    };


  return {
    UserModel,
    UserAddressModel,
    TenantModel,
    TenantUserModel,
    TenantRolePermissionModel,
    MasterModel,
    MasterPermissionModel,
    MasterRolePermissionModel,
    associate
  }
};


const { Sequelize, DataTypes } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const databaseConfig = require(__dirname + '/../config/databaseConfig.json')[env];

let models;
let UserModel,TenantModel, TenantUserModel, MasterModel, TenantRolePermissionModel, MasterPermissionModel, MasterRolePermissionModel, associate;

let initialized = false;
let sequelize;

class DatabaseResponse {
    constructor(responseType, data=null){
        this.responseType = responseType;
        this.data = data;
    }
}

const initialize = () => {
    if(initialized) return;

    console.log("[DATABASE SERVICE] Initializing database service...");

    if (databaseConfig.use_env_variable) {
        sequelize = new Sequelize(process.env[databaseConfig.use_env_variable], databaseConfig);
    } 
    else {
        sequelize = new Sequelize(databaseConfig.database, databaseConfig.username, databaseConfig.password, databaseConfig);
    }

    models = require('../models/models')(sequelize, DataTypes);
    UserModel = models.UserModel; 
    TenantModel = models.TenantModel
    TenantUserModel = models.TenantUserModel;
    MasterModel = models.MasterModel;
    TenantRolePermissionModel = models.TenantRolePermissionModel;
    MasterPermissionModel = models.MasterPermissionModel;
    MasterRolePermissionModel = models.MasterRolePermissionModel;
    associate = models.associate;
    
    associate();
    initialized = true;

    console.log("[DATABASE SERVICE] Database service initialization complete.");
}

const ResponseType = {
    Success: "Success",
    AccessDenied: "AccessDenied",
    NotFound: "NotFound",
    AlreadyExists: "AlreadyExists",
    Error: "Error",
}

const AccessType = {
    AssignMaster: { name: "assignMaster", requiresTarget: false },
    RevokeMaster: { name: "revokeMaster", requiresTarget: false },

    AddUser: { name: "addUser", requiresTarget: true },
    EditUser: { name: "editUser", requiresTarget: true },
    DeleteUser: { name: "deleteUser", requiresTarget: true },
    ViewAllUsers: {name: "viewAllUsers", requiresTarget: false},

    ViewTenantUsers: { name: "viewUsers", requiresTarget: true },
    AddUserToTenant: {name: "addUserToTenant", requiresTarget: true},
    RemoveUserFromTenant: { name: "removeUserFromTenant", requiresTarget: true },

    AddTenant: { name: "addTenant", requiresTarget: false },
    EditTenant: { name: "editTenant", requiresTarget: true },
    DeleteTenant: { name: "deleteTenant", requiresTarget: true },
    ViewTenants: { name: "viewTenants", requiresTarget: false },
    
    AddTenantRole: { name: "addTenantRole", requiresTarget: true },
    EditTenantRole: { name: "editTenantRole", requiresTarget: true },
    DeleteTenantRole: { name: "deleteTenantRole", requiresTarget: true },
    AssignTenantRole: { name: "assignTenantRole", requiresTarget: true },
    RevokeTenantRole: { name: "revokeTenantRole", requiresTarget: true },
    ViewTenantRoles: { name: "viewTenantRoles", requiresTarget: true}, // TODO NOT YET IMPLEMENTED IN SEQUELIZE MODELS AND DATABASE TABLES

    AddMasterRole: { name: "addMasterRole", requiresTarget: false },
    EditMasterRole: { name: "editMasterRole", requiresTarget: false },
    DeleteMasterRole: { name: "deleteMasterRole", requiresTarget: false },
    AssignMasterRole: { name: "assignMasterRole", requiresTarget: false },
    RevokeMasterRole: { name: "revokeMasterRole", requiresTarget: false },
    ViewMasterRoles: { name: "viewMasterRoles", requiresTarget: false}, // TODO NOT YET IMPLEMENTED IN SEQUELIZE MODELS AND DATABASE TABLES
};
const addMasterRolePermission = async ( masterId,tenantId,roleName) => {

    const masterRolePermission = await MasterRolePermissionModel.create({
        masterId: masterId,
        tenantId: tenantId,
        roleName: roleName,
        createdAt: new Date(),
    });
    return masterRolePermission;
};

const generateRandomId = () => {
    return Math.floor(Math.random() * 1000000); // Adjust range as needed
};
const addTenant = async (sourceUserId, tenantData) => {
    // Check if the user is authenticated and has permission to add a tenant
    if (!await isUserAuthenticatedFor({
            sourceUserId: sourceUserId,
            accessType: AccessType.AddTenant,
        })) {
        console.log('Access Denied for User ID:', sourceUserId); // Debug Log
        return new DatabaseResponse(ResponseType.AccessDenied);
    }
    try {
        // Check and generate a unique tenant ID
        let uniqueIdFound = false;
        let newTenantId;
        while (!uniqueIdFound) {
            newTenantId = tenantData.tenantId || generateRandomId();
            const existingTenant = await TenantModel.findOne({ where: { tenantId: newTenantId } });
            if (!existingTenant) {
                uniqueIdFound = true;
            }
        }
        const tenant = await TenantModel.create({
            ...tenantData,
            tenantId: newTenantId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log('Tenant Created:', tenant); // Debug Log

        if (!tenant) {
            console.error('Tenant creation failed, tenant is undefined.');
            return new DatabaseResponse(ResponseType.Error, "Tenant creation failed");
        }

        // Check if User is a Master, if not, make them one
        let master = await MasterModel.findOne({ where: { userId: sourceUserId } });
        if (master) {
            // Fetch or create a default 'Tenant Master' role for the new tenant
            let tenantMasterRole = await fetchOrCreateDefaultTenantMasterRole(tenant.tenantId); // Implement this function based on your logic
            if (!tenantMasterRole) {
                console.error('Default Tenant Master role could not be determined or created.');
                return new DatabaseResponse(ResponseType.Error, "Default Tenant Master role could not be determined or created");
            }
            console.log('Tenant Master Role:', tenantMasterRole.roleName); // Debug Log
            await TenantModel.increment('userCount', { by: 1, where: { tenantId: tenant.tenantId }});
            // Add the user as a TenantUser with the correct tenantRoleId
            const tenantMasterAssociation = await TenantUserModel.upsert({
                userId: sourceUserId,
                tenantId: tenant.tenantId,
                tenantRoleId: tenantMasterRole.tenantRoleId, // Use the correct Tenant Master role ID
                createdAt: new Date(),
            });
            const user = await UserModel.findOne({where: {userId: sourceUserId}});
            const email = user.email;

           registerUserToTenant(sourceUserId, {
                tenantId: tenant.tenantId,
                userId: sourceUserId,
                tenantRoleId: tenantMasterRole.tenantRoleId,
                email: email
            });
            
            console.log('TenantUser Association Created:', tenantMasterAssociation); // Debug Log
            
           addMasterRolePermission(master.masterId, tenant.tenantId, tenantMasterRole.roleName);
            
            const tenantMasterRolePermission = await MasterPermissionModel.upsert({
                userId: sourceUserId,
                tenantId: tenant.tenantId,
                tenantRoleId: tenantMasterRole.tenantRoleId, // Use the correct Tenant Master role ID
                createdAt: new Date(),
            });
            
            console.log('TenantMaster Association Created:', tenantMasterRolePermission); // Debug Log
        }

        return new DatabaseResponse(ResponseType.Success, { /* ... */ });

    } catch (error) {
        console.error("Error adding tenant or associating TenantMaster in database: ", error);
        return new DatabaseResponse(ResponseType.Error, "Error adding tenant or associating TenantMaster");
    }
};
const deleteTenant = async (sourceUserId, tenantId) => {
    // Check if the user has permission to delete a tenant
    if (!await isUserAuthenticatedFor({
        sourceUserId: sourceUserId,
        accessType: AccessType.DeleteTenant,
        target: tenantId
    })) return new DatabaseResponse(ResponseType.AccessDenied);

    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
        // Find the tenant
        const tenant = await TenantModel.findByPk(tenantId, { transaction });
        if (!tenant) {
            await transaction.rollback();
            return new DatabaseResponse(ResponseType.NotFound, "Tenant not found");
        }

        await TenantUserModel.destroy({
            where: { tenantId: tenantId },
            transaction: transaction
          });
      
          // Step 2: Delete TenantRolePermissionModel records
          await TenantRolePermissionModel.destroy({
            where: { tenantId: tenantId },
            transaction: transaction
          });
      
          // Step 3: Handle MasterRolePermissionModel records if necessary
          await MasterRolePermissionModel.destroy({
            where: { tenantId: tenantId },
            transaction: transaction
          });
          // Step 4: Delete the TenantModel record
          await TenantModel.destroy({
            where: { tenantId: tenantId },
            transaction: transaction
          });
      
          // Commit transaction
          await transaction.commit();
          return new DatabaseResponse(ResponseType.Success);
        } catch (error) {
          // Rollback transaction in case of error
          console.error("Error deleting tenant: ", error);
          return new DatabaseResponse(ResponseType.Error, "Error deleting tenant");

        }
};


const fetchOrCreateDefaultTenantMasterRole = async (tenantId) => {
    let role = await TenantRolePermissionModel.findOne({ 
        where: { 
            tenantId: tenantId,
            roleName: 'TenantManager' // Assuming 'Tenant Master' is your default role name
        }
    });

    if (!role) {
        role = await TenantRolePermissionModel.create({
            tenantId: tenantId,
            roleName: 'TenantManager',
        });
    }

    return role;
};


const isUserAuthenticatedFor = async ({sourceUserId: sourceUserId, accessType: accessType, target:target=null}) => {
    return true;
    console.log("SOURCE USER ID:", sourceUserId);
    
    master = await MasterModel.findOne({where: {userId: sourceUserId}});
    console.log(`[DATABASE SERVICE | ACCESS AUTHENTICATION] access type:${accessType.name} for user:${sourceUserId} targeted at tenant:${target}...`);
    
    try{
        if(accessType.requiresTarget){
            if(! target) return false;
            if(master){
                masterRolePermissions = await MasterRolePermissionModel.findOne({where: {
                    masterId: master.masterId,
                    tenantId: target}});

                if(!masterRolePermissions) return false;
                console.log("master role permission found: ", masterRolePermissions);
                return Boolean(masterRolePermissions[accessType.name]);
            }
            else{
                tenantRolePermissions = await TenantRolePermissionModel.findOne({where: {
                    userId: sourceUserId,
                    tenantId: target
                }});

                if(!tenantRolePermissions) return false;
                console.log("tenant role permission found: ", tenantRolePermissions);
                return Boolean(tenantRolePermissions[accessType.name]);
            }   
        }
        else{
            if(master){
                console.log("found master...:", master);
                masterPermissions = await MasterPermissionModel.findOne({where: {masterId: master.masterId}});

                if(!masterPermissions) return false;
                return Boolean(masterPermissions[accessType.name]);
            }
            else{
                tenantRolePermissions = await TenantRolePermissionModel.findOne({where: {
                    userId: sourceUserId,
                    tenantId: target
                }});

                if(!tenantRolePermissions) return false;
                console.log("tenant role permission found: ", tenantRolePermissions);
                return Boolean(tenantRolePermissions[accessType.name]);
            }
        }
    }
    catch(error){
        console.log("[DATABASE SERVICE] Error while authenticating role access..:", error);
    }
    
    return false;
    
}
// File: databaseService.js
// Add this function to the module.exports at the end of the file
const updateUserCount = async (tenantId) => {
    try {
      // Start a transaction for database operations
      const transaction = await sequelize.transaction();
  
      // Count the number of regular users in the tenant
      const userCount = await TenantUserModel.count({
        where: { tenantId: tenantId },
        transaction: transaction
      });
      
      // Count the number of masters (admins) in the tenant
      // Assuming that each master is also considered a user of the tenant
      const masterCount = await MasterModel.count({
        where: { tenantId: tenantId },
        transaction: transaction
      });
  
      // Update the user count in the tenant model
      // The total count is the sum of regular users and masters
      await TenantModel.update(
        { userCount: userCount + masterCount },
        {
          where: { tenantId: tenantId },
          transaction: transaction
        }
      );
      console.log("Master Countx:", masterCount);
        console.log("User Countzs:", userCount);
      // Commit the transaction
      await transaction.commit();
    } catch (error) {
      // Rollback the transaction in case of an error
      if (transaction) await transaction.rollback();
      console.error('Error updating tenant user count:', error);
      throw error; // Rethrow the error after rollback
    }
  };
  
const updateUser = async (sourceUserId, userId, updatedUserData) => {
    if (!await isUserAuthenticatedFor({
        sourceUserId: sourceUserId,
        accessType: AccessType.EditUser,
        target: userId
    })) return new DatabaseResponse(ResponseType.AccessDenied);

    try {
        // Update user details
        const user = await UserModel.findByPk(userId);
        if (!user) {
            return new DatabaseResponse(ResponseType.NotFound, "User not found");
        }
        await user.update(updatedUserData);

        let roleName = null;

        // Update user role if roleName is provided in updatedUserData
        if (updatedUserData.roleName) {
            const tenantUser = await TenantUserModel.findOne({
                where: { userId: userId },
                include: [{
                    model: TenantRolePermissionModel,
                    as: 'rolePermissions'
                }]
            });
            if (!tenantUser) {
                return new DatabaseResponse(ResponseType.NotFound, "TenantUser not found");
            }
            
            const tenantRole = await TenantRolePermissionModel.findOne({
                where: { roleName: updatedUserData.roleName, tenantId: tenantUser.tenantId }
            });
            if (!tenantRole) {
                return new DatabaseResponse(ResponseType.NotFound, "TenantRole not found");
            }
            await tenantUser.update({ tenantRoleId: tenantRole.tenantRoleId });

            roleName = tenantRole.roleName; // Update roleName to be returned in the response
        }

        // Return user data along with roleName (if updated)
        const userData = {
            ...user.get({ plain: true }),
            roleName: roleName
        };

        return new DatabaseResponse(ResponseType.Success, userData);
    } catch (error) {
        console.error("Error updating user in database: ", error);
        return new DatabaseResponse(ResponseType.Error, "Error updating user");
    }
}



const updateTenant = async (sourceUserId, tenantId, tenantData) => {
    if(!await isUserAuthenticatedFor({
        sourceUserId: sourceUserId,
        accessType: AccessType.EditTenant,
        target: tenantId})) 
            return new DatabaseResponse(ResponseType.AccessDenied);

    try {
        const tenant = await TenantModel.findByPk(tenantId);
        if (!tenant) {
            return new DatabaseResponse(ResponseType.NotFound, "Tenant not found");
        }
        await tenant.update(tenantData);
        return new DatabaseResponse(ResponseType.Success, tenant);
    } catch (error) {
        console.error("Error updating tenant in database: ", error);
        return new DatabaseResponse(ResponseType.Error, "Error updating tenant");
    }
}

const updateTenantRole = async(sourceUserId, tenantRoleId, tenantRoleData) => {
    console.log(`[DATABASE SERVICE] Updating tenant role data for SOURCE USER ID:${sourceUserId} targeted at Tenant Role ID:${tenantRoleId}`);
    if(!await isUserAuthenticatedFor({
        sourceUserId: sourceUserId,
        accessType: AccessType.EditTenantRole,
        target: tenantRoleData.tenantId})) 
            return new DatabaseResponse(ResponseType.AccessDenied);

    try {
        console.log(`[DATABASE SERVICE] Tenant Role Data: `, tenantRoleData);
        const tenantRole = await TenantRolePermissionModel.findByPk(tenantRoleId);
        if (!tenantRole) {
            return new DatabaseResponse(ResponseType.NotFound);
        }
        await tenantRole.update(tenantRoleData);
        return new DatabaseResponse(ResponseType.Success);
    } catch (error) {
        console.error("Error updating tenant in database: ", error);
        return new DatabaseResponse(ResponseType.Error);
    }
}


const isUserMaster = async (userId) => {
    console.log(`[DATABASE SERVICE] Checking if user:${userId} is a master user...`);
    return await MasterModel.findOne({where: {userId : userId}}) !== null;
}

const getTenantOfUser = async (sourceUserId, targetUserId) => {
    console.log(`[DATABASE SERVICE] Fetching tenant of user for source user:${sourceUserId} targeted at user:${targetUserId}`);
    const tenantUser = await TenantUserModel.findOne({
        where: { userId: targetUserId },
    });


    if(! await isUserAuthenticatedFor({
        sourceUserId: sourceUserId,
        accessType: AccessType.ViewTenants, 
        target: tenantUser.tenantId}))
            return new DatabaseResponse(ResponseType.AccessDenied);

    const tenant = await TenantModel.findOne(({
        where: { tenantId: tenantUser.tenantId},
    }));

    return tenant ? 
        new DatabaseResponse(ResponseType.Success, {tenant: tenant}) : 
        new DatabaseResponse(ResponseType.NotFound);
};
const fetchAllUsersLastLogin = async () => {
    const generateRandomIP = () => {
        return Array.from({ length: 4 }, () => Math.floor(Math.random() * 255)).join('.');
    };
    try {
        const users = await UserModel.findAll({
            attributes: ['email','lastLoginAt','lastActivityAt']
        });
        
        // If users are found
        if (users) {
            const usersWithIP = users.map(user => ({
                ...user.get({ plain: true }), // Spread existing user attributes
                IP: generateRandomIP()  // Add fake IP address
            }));
            return new DatabaseResponse(ResponseType.Success, usersWithIP);
        } else {
            return new DatabaseResponse(ResponseType.NotFound, 'No users found.');
        }
    } catch (error) {
        console.error("Error fetching users' last login information: ", error);
        return new DatabaseResponse(ResponseType.Error, 'Error fetching users\' last login information.');
    }
};

const fetchTenantsOfMaster = async (sourceUserId) => {
    try {
        const master = await MasterModel.findOne({ where: { userId: sourceUserId } });
        
        // If the user is a master
        if (master) {
            if(master.isSuperMaster == 1){
                const tenants = await TenantModel.findAll();
                return new DatabaseResponse(ResponseType.Success, {tenants: tenants});
            }

            const masterRolePermissions = await MasterRolePermissionModel.findAll({
                where: { masterId: master.masterId },
                attributes: ['tenantId'] 
            });

            if(!masterRolePermissions) return new DatabaseResponse(ResponseType.AccessDenied);

            const tenantIds = masterRolePermissions.map(permission => permission.tenantId);

            const tenants = await TenantModel.findAll({
                where: {
                    tenantId: tenantIds
                }
            });

            return new DatabaseResponse(ResponseType.Success, {tenants: tenants});
        } else {
            // If the user is not a master, check if the user is a tenant manager
            const tenantManager = await TenantUserModel.findOne({ where: { userId: sourceUserId } });

            if (!tenantManager)
                return new DatabaseResponse(ResponseType.AccessDenied);

            // Assuming tenantManager.tenantId provides the IDs of tenants the manager has access to
            const tenants = await TenantModel.findAll({
                where: {
                    tenantId: tenantManager.tenantId
                }
            });

            return new DatabaseResponse(ResponseType.Success, {tenants: tenants});
        }
    } catch (error) {
        console.error('Error fetching tenants for user:', error);
        return new DatabaseResponse(ResponseType.Error);
    }
}



const fetchUserProfile = async (sourceUserId, targetUserId) => {
    console.log(`[DATABASE SERVICE] Fetching user profile with source user:${sourceUserId} from target user:${targetUserId}`);
    const tenantOfTargetUser = await getTenantOfUser(sourceUserId, targetUserId);
    try{
        if(tenantOfTargetUser.responseType == ResponseType.Success){
            if( !await isUserAuthenticatedFor({
                    sourceUserId: sourceUserId, 
                    accessType: AccessType.ViewTenantUsers,
                    target: tenantOfTargetUser.data.tenant.tenantId}
                &&
                !await isUserAuthenticatedFor({
                    sourceUserId: sourceUserId,
                    accessType: AccessType.ViewAllUsers,
                })
                ))
                    return new DatabaseResponse(ResponseType.AccessDenied);
    
            
    
            user = await UserModel.findOne({ where: { userId: targetUserId } }); 
    
            return user ? 
                new DatabaseResponse(ResponseType.Success, {user: user}) :
                new DatabaseResponse(ResponseType.NotFound);
        }
        else{
            return new DatabaseResponse(ResponseType.NotFound);
        }
    }
    catch(error){
        console.error(`
            [DATABASE SERVICE] Error while Fetching User Profile for source User ID:${sourceUserId} targeted at User:${targetUserId}
            \nError:${error}`);
            
    }
    
}

const fetchTenantProfile = async(sourceUserId, tenantId) => {
    console.log(`[DATABASE SERVICE] Fetching tenant profile for source user:${sourceUserId} targeted at: ${tenantId}`);
    if(!await isUserAuthenticatedFor({
        sourceUserId: sourceUserId, 
        accessType: AccessType.ViewTenants,
        target: tenantId}))
            return new DatabaseResponse(ResponseType.AccessDenied);
            
    tenant = await TenantModel.findOne({where: {tenantId: tenantId}});

    console.log(`[DATABASE SERVICE] Found tenant: ${tenant}`);

    return tenant ?
        new DatabaseResponse(ResponseType.Success, {tenant: tenant}) : 
        new DatabaseResponse(ResponseType.NotFound);
}

const removeUserFromTenant = async(sourceUserId, tenantId, targetUserId) => {

    if(!await isUserAuthenticatedFor({
        sourceUserId: sourceUserId, 
        accessType: AccessType.RemoveUserFromTenant,
        target: tenantId}))
            return new DatabaseResponse(ResponseType.AccessDenied);

    const tenantUser = await TenantUserModel.findOne({
        where: { 
        tenantId: tenantId,
        userId: targetUserId
    }});

    if(tenantUser){
        await tenantUser.destroy();
        return new DatabaseResponse(ResponseType.Success);
    }
    else{
        return new DatabaseResponse(ResponseType.NotFound);
    }
}

const addUser = async(sourceUserId, userData) => {
    if(!await isUserAuthenticatedFor({
        sourceUserId: sourceUserId,
        accessType: AccessType.AddUser}))
            return new DatabaseResponse(ResponseType.AccessDenied);
    
    const user = await UserModel.findOne({where: {email: userData.email}});
    if(user) return new DatabaseResponse(ResponseType.AlreadyExists);

    const newUser = await UserModel.create(userData);
    
    if(newUser) return new DatabaseResponse(ResponseType.Success, {newUser: newUser});    
}
const fetchAllMasters = async () => {
    try {
        const masters = await MasterModel.findAll({
            include: [
                {
                    model: UserModel,
                    as: 'user', // Association alias defined in the model
                    attributes: ['email'], // Select only the email field from UserModel
                },
                {
                    model: MasterPermissionModel,
                    as: 'masterPermissions', // Association alias defined in the model
                    // Select specific fields you want from MasterPermissionModel
                    attributes: ['assignMaster', 'revokeMaster', 'addTenant', 'viewTenants', 'addMasterRole', 'editMasterRole', 'deleteMasterRole', 'assignMasterRole', 'revokeMasterRole', 'viewAllUsers'],
                },
                
            ],
            attributes: ['isSuperMaster'], // Select isSuperMaster from MasterModel
        });

        if (masters && masters.length > 0) {
            const masterDetails = masters.map(master => {
                const user = master.user; // User details from the association
                const permissions = master.masterPermissions; // Master permissions from the association
                return {
                    email: user.email,
                    isSuperMaster: master.isSuperMaster === 1,
                    assignMaster: permissions.assignMaster,
                    revokeMaster: permissions.revokeMaster,
                    addTenant: permissions.addTenant,
                    viewTenants: permissions.viewTenants,
                    addMasterRole: permissions.addMasterRole,
                    editMasterRole: permissions.editMasterRole,
                    deleteMasterRole: permissions.deleteMasterRole,
                    assignMasterRole: permissions.assignMasterRole,
                    revokeMasterRole: permissions.revokeMasterRole,
                    viewAllUsers: permissions.viewAllUsers,
                    
                };
            });

            return new DatabaseResponse(ResponseType.Success, { masters: masterDetails });
        } else {
            return new DatabaseResponse(ResponseType.NotFound, 'No masters found.');
        }
    } catch (error) {
        console.error("Error fetching masters: ", error);
        return new DatabaseResponse(ResponseType.Error, 'Error fetching masters.');
    }
};


  
const registerUserToTenant = async(sourceUserId, userData) => {
    if(!await isUserAuthenticatedFor({
        sourceUserId: sourceUserId,
        accessType: AccessType.AddUser}))
            return new DatabaseResponse(ResponseType.AccessDenied);
    
    const user = await UserModel.findOne({where: {email: userData.email}});
    if(user) return new DatabaseResponse(ResponseType.AlreadyExists);

    const newUser = await UserModel.create(userData);

    const newTenantUser = await TenantUserModel.create({
        tenantId: userData.tenantId,
        userId: newUser.userId,
        tenantRoleId: userData.tenantRoleId,
    });

    
    if(newTenantUser) return new DatabaseResponse(ResponseType.Success, {userId: newTenantUser.userId});
    return new DatabaseResponse(ResponseType.AlreadyExists);
}

const addUserToTenant = async(sourceUserId, targetUserId, tenantId) => {
    console.log(`[DATABASE SERVICE] Connecting user with ID:${targetUserId} to tenant with ID:${tenantId}`);
    if(!await isUserAuthenticatedFor({
        sourceUserId: sourceUserId,
        accessType: AccessType.AddUserToTenant,
        target: tenantId}))
            return new DatabaseResponse(ResponseType.AccessDenied);
    
    const tenantUser = await TenantUserModel.findOne({where : {userId: targetUserId, tenantId: tenantId}});
    if(tenantUser) return new DatabaseResponse(ResponseType.AlreadyExists);
    
    const newTenantUser = await TenantUserModel.create({
        tenantId: tenantId,
        userId: targetUserId
      });
    
    
    if(newTenantUser) return new DatabaseResponse(ResponseType.Success, {newTenantUser: newTenantUser});
}

const authenticateUser = async(email, password) => {
    const now = new Date().toISOString();
    const userModel = await UserModel.findOne({ where: { email, password } });
    if(userModel){
        userModel.lastLoginAt = now;
        await userModel.save();
        return new DatabaseResponse(ResponseType.Success, {userId: userModel.userId});
    } 
    else return new DatabaseResponse(ResponseType.NotFound);
}

const deleteUser = async(sourceUserId, targetUserId) => {
    if(!await isUserAuthenticatedFor({
        sourceUserId: sourceUserId,
        accessType: AccessType.DeleteUser}))
            return new DatabaseResponse(ResponseType.AccessDenied);

    const userModel = await UserModel.findOne({where: {userId: targetUserId}});
    if(!userModel) return new DatabaseResponse(ResponseType.NotFound);

    await UserModel.destroy({
        where: {
            userId: targetUserId
        }
    });

    return new DatabaseResponse(ResponseType.Success);
}

const fetchUsersOfTenant = async(sourceUserId, tenantId) => {
    console.log(`[DATABASE SERVICE] Processing fetch users of tenant request for source user ID:${sourceUserId} targeted at tenant ID:${tenantId}`);
    if(! await isUserAuthenticatedFor({
        sourceUserId: sourceUserId,
        accessType: AccessType.ViewTenantUsers,
        target: tenantId})) 
            return new DatabaseResponse(ResponseType.AccessDenied);

    const tenantUsers = await TenantModel.findOne({
        where: { tenantId: tenantId },
        include: [{
            model: UserModel,
        }]
    });

    if(! tenantUsers) return new DatabaseResponse(ResponseType.NotFound)
    else return new DatabaseResponse(ResponseType.Success, {users: tenantUsers.UserModels})
    
}

const fetchTenantRolesOfTenant = async(sourceUserId, tenantId) => {
    console.log(`[DATABASE SERVICE] Processing fetch tenant roles of tenant request for source user ID:${sourceUserId} targeted at tenant ID:${tenantId}`);
    if(! await isUserAuthenticatedFor({
        sourceUserId: sourceUserId,
        accessType: AccessType.ViewTenantUsers /* TODO !!! Change this AccessType to ViewTenantRoles and add new permission types accordingly */,
        target: tenantId})) 
            return new DatabaseResponse(ResponseType.AccessDenied);
    
    const tenantRolePermissions = await TenantRolePermissionModel.findAll({where: {tenantId: tenantId}});
    console.log(`[DATABASE SERVICE] Found tenant roles: ${tenantRolePermissions}`)
    if(tenantRolePermissions) return new DatabaseResponse(ResponseType.Success, {tenantRoles: tenantRolePermissions})
    else return new DatabaseResponse(ResponseType.NotFound);
}

const fetchTotalNumberOfUsers = async(sourceUserId) => {
    console.log(`[DATABASE SERVICE] Processing fetch total number of users request for source user ID:${sourceUserId}`);

    if(! await isUserAuthenticatedFor({
        sourceUserId: sourceUserId,
        accessType: AccessType.ViewAllUsers})) 
            return new DatabaseResponse(ResponseType.AccessDenied);

    const totalNumberOfUsers = await UserModel.count();
    if(totalNumberOfUsers && totalNumberOfUsers > 0)
        return new DatabaseResponse(ResponseType.Success, {totalNumberOfUsers: totalNumberOfUsers});
    else 
        return new DatabaseResponse(ResponseType.NotFound);
}

const fetchTotalNumberOfTenants = async(sourceUserId) => {
    console.log(`[DATABASE SERVICE] Processing fetch total number of tenants request for source user ID:${sourceUserId}`);
    const isUserMaster = await MasterModel.findOne({where: {userId: sourceUserId}});
    if(!isUserMaster){
         const totalNumberOfTenants = 1;
         return new DatabaseResponse(ResponseType.Success, {totalNumberOfTenants: totalNumberOfTenants});
    }
    const totalNumberOfTenants = await TenantModel.count();
    if(totalNumberOfTenants && totalNumberOfTenants > 0)
        return new DatabaseResponse(ResponseType.Success, {totalNumberOfTenants: totalNumberOfTenants});
    else 
        return new DatabaseResponse(ResponseType.NotFound);
}


const getUserRole = async (userId) => {
    try {
        
        // Step 1: Check if the user is a master
        const masterRecord = await MasterModel.findOne({
            where: { userId: userId }
        });
 
        if (masterRecord) {
            if(masterRecord.isSuperMaster == 1){
                return new DatabaseResponse(ResponseType.Success, { roleName: 'Super Master' });
            }else{
                return new DatabaseResponse(ResponseType.Success, { roleName: 'Master' });
            }

            
        }
        
        // Step 2: If not a master, check tenant role permissions
        const tenantUserRole = await TenantUserModel.findOne({
            where: { userId: userId },
            include: [{
                model: TenantRolePermissionModel,
                as: 'rolePermissions',
                attributes: ['roleName']
            }]
        });
        console.log("Tenant User Role:", tenantUserRole);

        if (tenantUserRole && tenantUserRole.rolePermissions) {
            if(tenantUserRole.rolePermissions.roleName == 'TenantManager'){
                return new DatabaseResponse(ResponseType.Success, { roleName: 'Tenant Manager' });
            }
            return new DatabaseResponse(ResponseType.Success, { roleName: tenantUserRole.rolePermissions.roleName });
        }
        // Step 3: If no specific role found, default to 'User'
        return new DatabaseResponse(ResponseType.Success, { roleName: 'User' });

    } catch (error) {
        console.error('Error fetching user role:', error);
        return new DatabaseResponse(ResponseType.Error, 'Error fetching user role');
    }
};

const fetchUserRoleName = async (tenantId, userId) => {
    try {
        
        if (!initialized) initialize();

        const tenantUser = await TenantUserModel.findOne({
            where: { tenantId: tenantId, userId: userId },
            include: [{
                model: TenantRolePermissionModel,
                as: 'rolePermissions',
                attributes: ['roleName']
            }]
        });

        if (!tenantUser) {
            return new DatabaseResponse(ResponseType.NotFound, "Tenant or user not found");
        }

        return new DatabaseResponse(ResponseType.Success, { roleName: tenantUser.rolePermissions.roleName });
    } catch (error) {
        console.error('Error fetching user role name:', error);
        return new DatabaseResponse(ResponseType.Error, "Error fetching user role name");
    }
}



const fetchTotalNumberOfMasters = async(sourceUserId) => {
    console.log(`[DATABASE SERVICE] Processing fetch total number of masters request for source user ID:${sourceUserId}`);

    const totalNumberOfMasters = await MasterModel.count();
    if(totalNumberOfMasters && totalNumberOfMasters > 0)
        return new DatabaseResponse(ResponseType.Success, {totalNumberOfMasters: totalNumberOfMasters});
    else 
        return new DatabaseResponse(ResponseType.NotFound);
}

const fetchUserTypeCountDistributionData = async(sourceUserId) => {
    console.log(`[DATABASE SERVICE] Processing fetch user type distribution data request for source user ID:${sourceUserId}`);

    let numMasters = 0, numTenantAdmins = 0, numEndUsers = 0, numTotalUsers = 0;

    const masterRecord = await MasterModel.findOne({ where: { userId: sourceUserId } });

    if (masterRecord && masterRecord.isSuperMaster) {
        numTotalUsers = await UserModel.count();
        numMasters = await MasterModel.count();
        numTenantAdmins = await TenantRolePermissionModel.count({
            where: {
                roleName: "TenantManager"
            }
        });
    } else if (masterRecord) {
       
        const managedTenants = await MasterRolePermissionModel.findAll({
            where: { masterId: masterRecord.masterId },
            attributes: ['tenantId']
        });
        

        const tenantIds = managedTenants.map(permission => permission.tenantId);

        numTotalUsers = await TenantUserModel.count({
            where: {
                tenantId: tenantIds
            }
        });

        numTenantAdmins = await TenantRolePermissionModel.count({
            where: {
                tenantId: tenantIds,
                roleName: "TenantManager"
            }
        });
        numMasters = await MasterModel.count();
    } else {
        // Fetch data for Tenant Manager
    const managedTenant = await TenantUserModel.findOne({
            where: { userId: sourceUserId },
            include: [{
            model: TenantRolePermissionModel,
            as: 'rolePermissions',
            attributes: ['roleName', 'tenantId']
        }]
    });
    if(managedTenant && managedTenant.rolePermissions){
        const tenantId = managedTenant.rolePermissions.tenantId;
        numTotalUsers = await TenantUserModel.count({
            where: {
                tenantId: tenantId
            }
        });
    }
    if (managedTenant && managedTenant.rolePermissions.roleName === "TenantManager") {
        numTotalUsers = await TenantUserModel.count({
            where: {
                tenantId: managedTenant.rolePermissions.tenantId
            }
        });

        // Count Tenant Managers within the tenant managed by this user
        numTenantAdmins = await TenantUserModel.count({
            where: {
                tenantId: managedTenant.rolePermissions.tenantId,
                '$rolePermissions.roleName$': "TenantManager"
            },
            include: [{
                model: TenantRolePermissionModel,
                as: 'rolePermissions',
                attributes: []
            }]
        });

        numMasters = 0;
    }
    }

    numEndUsers = numTotalUsers ;

    const percentageMasters = numTotalUsers > 0 ? (numMasters / numTotalUsers * 100) : 0;
    const percentageTenantAdmins = numTotalUsers > 0 ? (numTenantAdmins / numTotalUsers * 100) : 0;
    const percentageEndUsers = numTotalUsers > 0 ? (numEndUsers / numTotalUsers * 100) : 0;

    const userTypeCountDistributionData = {
        percentages: {
            endUsers: percentageEndUsers,
            tenantAdmins: percentageTenantAdmins,
            masters: percentageMasters,
        },
        counts: {
            endUsers: numEndUsers,
            tenantAdmins: numTenantAdmins,
            masters: numMasters,
            totalUsers: numTotalUsers
        }
    }

    console.log(`[DATABASE SERVICE] User Type Count Distribution Data: ${JSON.stringify(userTypeCountDistributionData)}`);
    return new DatabaseResponse(ResponseType.Success, { userTypeCountDistributionData: userTypeCountDistributionData });
}



module.exports = {
    ResponseType,
    initialize,
    authenticateUser,
    isUserMaster,
    fetchTenantProfile,
    fetchUserProfile, 
    fetchTenantsOfMaster,
    isUserAuthenticatedFor,
    getTenantOfUser,
    fetchUsersOfTenant,
    removeUserFromTenant,
    deleteUser,
    addUser,
    addUserToTenant,
    registerUserToTenant,
    fetchTenantRolesOfTenant,
    fetchTotalNumberOfUsers,
    fetchTotalNumberOfTenants,
    fetchUserTypeCountDistributionData,
    fetchTotalNumberOfMasters,
    updateUser,
    updateTenant,
    updateTenantRole,
    fetchUserRoleName,
    addTenant,
    deleteTenant,
    updateUserCount,
    getUserRole,
    fetchAllUsersLastLogin,
    fetchAllMasters
}
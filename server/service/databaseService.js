const { Sequelize, DataTypes } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const databaseConfig = require(__dirname + '/../config/databaseConfig.json')[env];

let models;
let UserModel, TenantModel, TenantUserModel, MasterModel, TenantRolePermissionModel, MasterPermissionModel, MasterRolePermissionModel, associate;

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

    console.log("initializing database service");

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

    console.log("database service initialization complete.");
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
    RemoveUserFromTenant: { name: "removeUserFromTenant", requiresTarget: true },
    DeleteUser: { name: "deleteUser", requiresTarget: true },
    ViewAllUsers: {name: "viewAllUsers", requiresTarget: false},
    ViewTenantUsers: { name: "viewUsers", requiresTarget: true },
    AddUserToTenant: {name: "addUserToTenant", requiresTarget: true},

    AddTenant: { name: "addTenant", requiresTarget: false },
    EditTenant: { name: "editTenant", requiresTarget: true },
    DeleteTenant: { name: "deleteTenant", requiresTarget: true },
    ViewTenants: { name: "viewTenants", requiresTarget: false },
    

    AddTenantRole: { name: "addTenantRole", requiresTarget: true },
    EditTenantRole: { name: "editTenantRole", requiresTarget: true },
    DeleteTenantRole: { name: "deleteTenantRole", requiresTarget: true },
    AssignTenantRole: { name: "assignTenantRole", requiresTarget: true },
    RevokeTenantRole: { name: "revokeTenantRole", requiresTarget: true },

    AddMasterRole: { name: "addMasterRole", requiresTarget: false },
    EditMasterRole: { name: "editMasterRole", requiresTarget: false },
    DeleteMasterRole: { name: "deleteMasterRole", requiresTarget: false },
    AssignMasterRole: { name: "assignMasterRole", requiresTarget: false },
    RevokeMasterRole: { name: "revokeMasterRole", requiresTarget: false }
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

const fetchTenantsOfMaster = async (sourceUserId) => {
    try {
        const master = await MasterModel.findOne({ where: { userId: sourceUserId } });
        if (!master) return new DatabaseResponse(ResponseType.AccessDenied);
    
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
      } catch (error) {
        console.error('Error fetching tenants for master user:', error);
        return new DatabaseResponse(ResponseType.Error);
      }
    
}


const fetchUserProfile = async (sourceUserId, targetUserId) => {
    console.log(`[DATABASE SERVICE] Fetching user profile with source user:${sourceUserId} from target user:${targetUserId}`);
    const tenantOfTargetUser = await getTenantOfUser(sourceUserId, targetUserId);
    console.log("TEST PASS");
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

    await TenantUserModel.destroy({
        where: { 
            tenantId: tenantId,
            userId: targetUserId
        }
    });

    return new DatabaseResponse(ResponseType.Success);
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

const addUserToTenant = async(sourceUserId, targetUserId, tenantId) => {
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
    const userModel = await UserModel.findOne({ where: { email, password } });
    if(userModel) return new DatabaseResponse(ResponseType.Success, {userId: userModel.userId});
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

    if(! tenantUsers) return new DatabaseResponse(ResponseType.NotFound);
    else return new DatabaseResponse(ResponseType.Success, {users: tenantUsers.UserModels});
    
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
}
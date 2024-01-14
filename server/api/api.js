const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const databaseService = require("../service/databaseService");

const getDynamicSecretKeyForUser = (user) => {
    const secretKeyLength = 6; // You can adjust the length as needed
    return crypto.randomInt(0, Math.pow(10, secretKeyLength)).toString();
};

module.exports = {
    "post": {
        "/api/check-logged-in-status": async(req, res) => {
            res.status(200).json({status: 'success', isLoggedIn: req.session.loggedUser ? true : false});
        },
       /* "/api/get-user-details": async (req, res) => {
            const { userId } = req.body;
            console.log("Fetching user details for userId: ", userId);
            try {
                const userModel = await UserModel.findOne({ where: { userId } });
                if (userModel) {
                    res.json({
                        status: "success",
                        message: "User details retrieved successfully",
                        user: userModel
                    });
                } else {
                    res.status(404).json({
                        status: "userNotFound",
                        message: "User not found"
                    });
                }
            } catch (error) {
                console.error("Error retrieving user details from database: ", error);
                if (!res.headersSent) {
                    res.status(500).json({
                        status: "error",
                        message: "Error retrieving user details"
                    });
                }
            }
        },*/
        
        "/api/delete-tenant-user": async (req, res) => {
          const {sourceUserID, tenantId, targetUserId } = req.body;
          try {
            console.log(`Deleting user with ID:${targetUserId} from tenant with ID:${tenantId}`);
            const databaseResponse = await databaseService.removeUserFromTenant(sourceUserId, tenantId, targetUserId);

            if(databaseResponse.responseType === databaseService.ResponseType.Success){
              res.status(200).json({
                status: "success"});
            }
            else if(databaseResponse.responseType === databaseService.ResponseType.AccessDenied){
              res.status(505).send();
            }
            else if(databaseResponse.responseType === databaseService.ResponseType.NotFound){
              res.status(404).send();
            }
          } 
          catch (error) {
            console.error("Error deleting tenant user: ", error);
            res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
          }
        },
        "/api/register-user": async (req, res) => {
            const {sourceUserId, email, password, firstName, middleName, lastName, tenantId, roleName } = req.body;

            try{
              const databaseResponse = await databaseService.addUser(sourceUserId, {email, password, firstName, middleName, lastName, tenantId, roleName});
              if(databaseResponse.responseType === databaseService.ResponseType.Success){
                res.json({
                  status: "success",
                  userId: databaseResponse.data.newUser.userId,
                }).send();
              }
              else if(databaseResponse.responseType === databaseService.ResponseType.AlreadyExists){
                res.json({
                  status: "userExists",
                  message: "User already exists"
                }).send();
              }
              else if(databaseResponse.responseType === databaseService.ResponseType.AccessDenied){
                res.status(505).send();
              }
            }
            catch (error) {
              console.error("Error in user registration: ", error);
              res.status(500).json({ message: "Registration Error" }).send();
            }
            
            /* try {
              const userModel = await UserModel.findOne({ where: { email } });
              if (!userModel) {
                const newUser = await UserModel.create({
                  email,
                  password, 
                  firstName,
                  middleName,
                  lastName
                });
                // Associate new user with tenant
                await TenantUserModel.create({
                  tenantId: tenantId,
                  userId: newUser.userId,
                  roleName: roleName
                });
          

              } else {
                
              }
            }catch (error) {
              console.error("Error in user registration: ", error);
              res.status(500).json({ message: "Registration Error" }).send();
            } */
          },
          

        "/api/authenticate-client": async(req, res) => {
            console.log("Authentication request received...");
            const { email, password } = req.body;
            try{
              const databaseResponse = await databaseService.authenticateUser(email, password);

              if(databaseResponse.responseType === databaseService.ResponseType.Success){
                res.json({
                  "userId": databaseResponse.data.userId,
                  "status" : "success"
                }).send();
              }
              else if(databaseResponse.responseType === databaseService.ResponseType.NotFound){
                console.log("Login failed due to invalid credentials.");
                res.json({ 
                    status: "invalidCredentials",
                    message: 'Login failed due to invalid credentials.'})
                    .send();
              }
            }
            catch(error){
              console.error("Error logging in: ", error);
              res.json({ status: 500, message: 'Error logging in'}).send();
            }

            /* try {
                const userModel = await UserModel.findOne({ where: { email, password } });
                if (userModel) {
                    const dynamicSecretKey = getDynamicSecretKeyForUser(userModel);
                    console.log(`Dynamic secret key for ${userModel.email}: ${dynamicSecretKey}`);
                    const payload = { userId: userModel.userId, email: userModel.email };
                    const token = jwt.sign(payload, dynamicSecretKey, { expiresIn: '5m' });

                    res.json({
                        "userId": userModel.userId,
                        "status" : "success"
                    }).send();
                    
                } else {
                    console.log("Login failed due to invalid credentials.");
                    res.json({ 
                        status: "invalidCredentials",
                        message: 'Login failed due to invalid credentials.'})
                        .send();
                }
            } catch (error) {
                console.error("Error logging in: ", error);
                res.json({ status: 500, message: 'Error logging in'}).send();
            } */
        },

        "/api/fetch-tenant-roles": async (req, res) => {
            console.log("Tenant roles fetch request received... (disabled)");
            /* const { userId } = req.body;
            let isMaster = false;

            if( masterModel = MasterModel.findOne({where: {userId : userId}})){
              isMaster = true;
              
            } 
          
            try {
              const tenantRoles = await TenantUserModel.findAll({
                where: { userId },
                include: [{ model: TenantModel, attributes: ['tenantId', 'name'] }],
              });
          
              if (tenantRoles && tenantRoles.length > 0) {
                console.log("tenant roles list : ", tenantRoles);
                
                const tenantNames = {};

                tenantRoles.forEach((tenantRole) => {
                  const { tenantId, name } = tenantRole.TenantModel;
                  tenantNames[tenantId] = name;
                });

                console.log("tenant names list: ", tenantNames);
          
                res.json({
                  status: "success",
                  tenantRoles: tenantRoles,
                  tenantNames: tenantNames,
                }).send();
              } else {
                res.json({ status: 404 }).send();
              }
            } catch (error) {
              console.error("Error fetching tenant roles: ", error);
              res.json({ status: 500 }).send();
            } */
        },

        "/api/fetch-tenant-users": async(req, res) => {
            const {userId, tenantId} = req.body;
            if(! userId || ! tenantId){
                res.json({
                    status: 505
                }).send();
                return;
            } 
            console.log(`Fetching users from Tenant: ${tenantId} for User: ${userId}}`);

            try{
              const databaseResponse = await databaseService.fetchUsersOfTenant(userId, tenantId);
              if(databaseResponse.responseType === databaseService.ResponseType.Success){
                res.json({
                  status: "success",
                  users: databaseResponse.data.users,
                }).send();
              }
              else if(databaseResponse.responseType === databaseService.ResponseType.AccessDenied){
                res.status(505).send();
              }
              else if(databaseResponse.responseType === databaseService.ResponseType.NotFound){
                res.status(404).send();
              }
              console.log(databaseResponse);
            }
            catch(error){
              console.log("Error fetching users from tenant: ", error);
              res.json({status:503}).send();
            }

            /* try{


                const masterUserModel = await MasterModel.findOne({where: {userId: userId}});
                const tenantUserModel = await TenantUserModel.findOne( {where: {userId, tenantId}});

                const tenantUsers = await TenantModel.findOne({
                    where: { tenantId: tenantId },
                    include: [{
                      model: UserModel,
                    }]
                });

                if(masterUserModel){
                    res.json({
                        status: "success",
                        users: tenantUsers.UserModels,
                    }).send();
                    return;
                }
                
                if(tenantUserModel){
                    const tenantRolePermissionModel = await tenantRolePermissionModel.findOne( {where: {tenantId, roleName}});

                    if(! tenantRolePermissionModel){
                        console.log("Tenant Role Permission Model not found");
                        res.json({status: 505}).send();
                        return;
                    }

                    if(! tenantRolePermissionModel.hasFullAccess || tenantRolePermissionModel.canViewUsers){
                        console.log("User does not have appropriate access to the tenant.");
                        res.json({
                            status: "accessDenied",
                            message: "User's role does not have access to target Tenant"
                        }).send();
                        return;
                    }

                    console.log(tenantUsers);
                    
                    if (tenantUsers) {                        
                        res.json({
                            status: "success",
                            users: tenantUsers.UserModels,
                        }).send();
                    } else {
                        res.json({
                            status: "usersNotFound",
                        }).send();
                    }

                } else{
                    res.json({status: "roleNotFound"}).send();
                }
            }
            catch(error){
                console.log("Error fetching users from tenant: ", error);
                res.json({status:503}).send();
            } */

        },
        
        "/api/check-master-user": async(req, res) => {
            console.log("Checking master user...");
            const {userId} = req.body;

            try{
              const isUserMaster = databaseService.isUserMaster(userId);
              res.json({status: "success", data: {isUserMaster: isUserMaster}});
            }
            catch(error){
              console.log("Error checking master user status: ", error);
              res.json({
                  status: 500
              }).send();
            }
        },

        "/api/fetch-tenants-of-master": async (req, res) => {
          console.log("Fetching tenants...");
          const { userId } = req.body;

          if (!userId) {
            res.json({
              status: "userIdNotFound"
            }).send();
            return;
          }
          
          try{
            const databaseResponse = await databaseService.fetchTenantsOfMaster(userId);
            if(databaseResponse.responseType === databaseService.ResponseType.Success){
              res.json({
                status: "success",
                tenants: databaseResponse.data.tenants
              }).send();
            }
            else if(databaseResponse.responseType === databaseService.ResponseType.AccessDenied){
              res.status(505).send();
            }
          }
          catch(error){
            console.log("Error:", error);
            res.status(500).send();
          }
          
          /* try {
              const master = await MasterModel.findOne({
                where: { userId },
                include: [
                  {
                    model: MasterRolePermissionModel,
                    attributes: ['masterId'],
                    include: [
                      {
                        model: TenantModel,
                        attributes: ['tenantId', 'name'],
                      },
                    ],
                  },
                ],
              });
          
              if (master) {
                if (!master.MasterRolePermissionModel) {
                  console.log("Master does not have any permission models");
                  res.json({
                    status: "roleNotFound"
                  }).send();
                  return;
                }
                const tenants = master.MasterRolePermissionModel.reduce((acc, rolePermission) => {
                  const { tenantId, name } = rolePermission.TenantModel;
                  acc[tenantId] = {
                    tenantId: tenantId,
                    name: name
                  };
                  return acc;
                }, {});
          
                console.log("Sending tenants for master:", tenants);
          
                res.json({
                  status: "success",
                  tenants: JSON.stringify(tenants)
                }).send();
              }
               else {
                // If not a master, check if it's a tenant user
                console.log("User is not a master. Checking if it's a tenant user...");
                const tenantUser = await TenantUserModel.findOne({ where: { userId } });
          
                if (tenantUser) {
                  if (!tenantUser.tenantRolePermissionModel) {
                    console.log("Tenant user does not have any permission models");
                    res.json({
                      status: "roleNotFound"
                    }).send();
                    return;
                  }
          
                  const tenants = tenantUser.tenantRolePermissionModel.reduce((acc, rolePermission) => {
                    const { tenantId, name } = rolePermission.TenantModel;
                    acc[tenantId] = {
                      tenantId: tenantId,
                      name: name
                    };
                    return acc;
                  }, {});
          
                  console.log("Sending tenants for tenant user:", tenants);
          
                  res.json({
                    status: "success",
                    tenants: JSON.stringify(tenants)
                  }).send();
                } else {
                  console.log(`User with User ID:${userId} was not found.`);
                  res.json({
                    status: "userNotFound"
                  }).send();
                }
              }
              } catch (error) {
              console.log("Error:", error);
              res.status(500).json({
                status: "error"
              }).send();
            } */
            
          },

        "/api/fetch-tenant-of-user": async(req, res) => {
          const{sourceUserId, targetUserId} = req.body;
          if(! sourceUserId || ! targetUserId){
            res.json({
                status: "accessDenied"
            }).send();
            console.log("missing id for fetch tenant of user request");
            return;
          }

          try{
            const databaseResponse = await databaseService.getTenantOfUser(sourceUserId, targetUserId);
            if(databaseResponse.responseType === databaseService.ResponseType.Success){
              const tenantId = databaseResponse.data.tenant.tenantId;
              res.json({
                status: "success",
                tenant: databaseResponse.data.tenant
              }).send();
            }
            else if(databaseResponse.responseType === databaseService.ResponseType.AccessDenied){
              res.status(505).send();
            }
            else if(databaseResponse.responseType === databaseService.ResponseType.NotFound){
              console.log("tenant not found");
              res.status(404).send();
            }
          }
          catch(error){
            console.error("Error while fetching tenant of user  : ", error);
              if (!res.headersSent) { 
                  res.status(500).send();
            }
          }
        },
          

        "/api/fetch-user-profile": async (req, res) => {
            const {sourceUserId, targetUserId} = req.body;
            if(! sourceUserId || ! targetUserId){
                res.json({
                    status: "accessDenied"
                }).send();
                console.log("test 1");
                return;
            }
            console.log(`Processing fetch user details request from User:${sourceUserId} targetted at User:${targetUserId}`);

            try{
              const databaseResponse = await databaseService.fetchUserProfile(sourceUserId, targetUserId);
              if(databaseResponse.responseType === databaseService.ResponseType.Success){
                res.json({
                  status: "success",
                  message: "User details retrieved successfully",
                  user: databaseResponse.data.user
                }).send();
              }
              else if(databaseResponse.responseType === databaseService.ResponseType.AccessDenied){
                res.status(505).send();
              }
              else if(databaseResponse.responseType === databaseService.ResponseType.NotFound){
                res.status(404).send();
              }
            }
            catch(error){
              console.error("Error retrieving user details from database: ", error);
                if (!res.headersSent) { 
                    res.status(500).send();
              }
            }
            /* 
            let hasPermission = false;

            // check if requesting self details
            if(sourceUserId === targetUserId) hasPermission = true;
            
            try{

                // check if user is master
                if(!hasPermission && await MasterModel.findOne({where: {userId: sourceUserId}})){
                    hasPermission = true;
                }

                // check if user has the necessary permissions to the target user's tenant
                if(!hasPermission){
                    const targetTenantUser = await TenantUserModel.findOne({where: {userId: targetUserId}});
                    const sourceTenantUser = await TenantUserModel.findOne({where: {userId: sourceUserId}});
                    if(sourceTenantUser.tenantId === targetTenantUser.tenantId ){
                        const sourceTenantRoles = TenantRolePermissionModel.findOne({
                            where: {
                                tenantId: sourceTenantUser.tenantId,
                                roleName: sourceTenantUser.roleName}});
                        
                        if(sourceTenantRoles.canViewUsers) hasPermission = true;
                    }
                }

            
                // if still not permitted, then deny access
                if(!hasPermission){
                    console.log("test 2");
                    res.json({
                        status: "accessDenied"
                    }).send();
                    return;
                }

                // find target's user model
                const userModel = await UserModel.findOne({ where: { userId: targetUserId } });
                console.log("user model: ", userModel);
                if (userModel) {
                    console.log("test 3");
                    res.json({
                        status: "success",
                        message: "User details retrieved successfully",
                        user: userModel
                    }).send(); 
                    return;
                } else {
                    res.json({
                        status: "userNotFound",
                        message: "User not found"
                    }).send(); 
                }

                
            } 
            catch (error) {
                console.error("Error retrieving user details from database: ", error);
                if (!res.headersSent) { 
                    res.status(500).send();
                }
            } */
        },

        "/api/fetch-tenant-profile": async(req, res) => {
            const {userId, tenantId} = req.body;
            if(! userId || ! tenantId){
                res.status(505).send();
                return;
            }

            try{
              const databaseResponse = await databaseService.fetchTenantProfile(userId, tenantId);
              console.log("FETCH TENANT PROFILE DATABASE RESPONSE: ", databaseResponse);
              if(databaseResponse.responseType === databaseService.ResponseType.Success){
                res.json({
                  status: "success",
                  tenant: databaseResponse.data.tenant
                }).send();

                
              }
              else if(databaseResponse.responseType === databaseService.ResponseType.AccessDenied){
                res.status(505).send();
              }
              else if(databaseResponse.responseType === databaseService.ResponseType.NotFound){
                res.status(404).send();
              }
            }
            catch(error){
              console.error(`Error while fetching tenant profile for source user ID:${userId} targeted at tenant ${tenantId}: ${error}`);
              res.status(500).send();
            }

            /* let hasPermission = false;

            try{
                // check if user is master
                if(await MasterModel.findOne({where : {userId: userId}})) hasPermission = true;

                if(!hasPermission){
                    res.status(505).send();
                    return;
                }

                // check if tenant exists
                const tenantModel = await TenantModel.findOne({where: {tenantId: tenantId}});

                if(!tenantModel){
                    res.status(404).send();
                    return;
                }

                res.json({
                    status: "success",
                    tenant: tenantModel
                }).send();

            } catch(error){
                console.error("Error retrieving tenant details from database. Error: ", error);
                if(!res.headersSent){
                    res.status(500).send();
                }
            } */
            
        }


    },
    
    "get": {
        
    }
}
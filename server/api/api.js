const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const databaseConfig = require(__dirname + '/../config/databaseConfig.json')[env];

let sequelize;
if (databaseConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[databaseConfig.use_env_variable], databaseConfig);
} else {
  sequelize = new Sequelize(databaseConfig.database, databaseConfig.username, databaseConfig.password, databaseConfig);
}

const models = require('../models/models')(sequelize, DataTypes);
const { UserModel, TenantModel, TenantUserModel, TenantRolePermissionModel, associate} = models;

associate();

const getDynamicSecretKeyForUser = (user) => {
    const secretKeyLength = 6; // You can adjust the length as needed
    return crypto.randomInt(0, Math.pow(10, secretKeyLength)).toString();
};

module.exports = {
    "post": {
        "/api/check-logged-in-status": async(req, res) => {
            res.status(200).json({status: 'success', isLoggedIn: req.session.loggedUser ? true : false});
        },

        "/api/register-user": async (req,res) => {
            const {email, password, firstName, middleName, lastName} = req.body;
            try{
                const userModel = await UserModel.findOne({where: {email}});
                if(! userModel){
                    const newUser = await UserModel.create({
                        email,
                        password, 
                        firstName,
                        middleName,
                        lastName
                    });
        
                    res.json({
                        status: "success",
                        message: "User registered successfully",
                        userId: newUser.userId,
                    }).send();
                }
                else{
                    res.json({
                        status: "userExists",
                        message: "User already exists"
                    }).send();
                }
            }
            catch(error)
            {
                console.error("Error checking user existence in database upon registration: ", error);
                res.json({status: 500, message: "Registration Error"}).send();
            }
        
            
        },

        "/api/authenticate-client": async(req, res) => {
            console.log("Authentication request received...");
            const { email, password } = req.body;

            try {
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
            }
        },

        "/api/fetch-tenant-roles": async (req, res) => {
            console.log("Tenant roles fetch request received...");
            const { userId } = req.body;
          
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
            }
          },

        "/api/fetch-users": async(req, res) => {


            const {userId, tenantId, roleName} = req.body;
            if(! userId || ! tenantId || ! roleName){
                res.json({
                    status: 505
                }).send();
                return;
            } 

            console.log(`Fetching users from tenant with TenantID: ${tenantId} and Role: ${roleName}`);
            try{
                const tenantUserModel = await TenantUserModel.findOne( {where: {userId, tenantId, roleName}});
                
                if(tenantUserModel){
                    const tenantRolePermissionModel = await TenantRolePermissionModel.findOne( {where: {tenantId, roleName}});

                    if(! tenantRolePermissionModel){
                        console.log("Tenant Role Permission Model not found");
                        res.json({
                            status: 505
                        }).send();
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

                    const tenantUsers = await TenantModel.findOne({
                        where: { tenantId: tenantId },
                        include: [{
                          model: UserModel,
                        }]
                      });

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
                    res.json({
                        status: "roleNotFound"
                    }).send();
                }
            }
            catch(error){
                console.log("Error fetching users from tenant: ", error);
                res.json({
                    status:503
                }).send();
            }

        }


    },
    
    "get": {
        "/api/get-user-details": async (req, res) => {
            const {userId} = req.query;
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
        }
    }
}
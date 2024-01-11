const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const databaseConfig = require(__dirname + '/../config/databaseConfig.json')[env];
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
let sequelize;
if (databaseConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[databaseConfig.use_env_variable], databaseConfig);
} else {
  sequelize = new Sequelize(databaseConfig.database, databaseConfig.username, databaseConfig.password, databaseConfig);
}

const models = require('../models/models')(sequelize, DataTypes);
const { UserModel, TenantModel, TenantUserModel, MasterModel, TenantRolePermissionModel, MasterRolePermissionModel, associate} = models;

associate();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'crims21mailer@gmail.com',
      pass:'Selcuk1996.',
      clientId: '205216410765-l2vs8hum25v9vkencnkd877o3at69ch8.apps.googleusercontent.com',
      clientSecret: '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',
      refreshToken: 'ya29.a0AfB_byDTcJP861sD6D1Q7FXGbBq0S2YOy6wNc-RPWgXKwwwL8HvAfOkrPIInoccaPX3uzz_1nJmUPZB7ZBbFLTfOt_p8_GsxS7hSGPKZEKjP9ZsQSp7NDEX847Z01YL4FAasSABTQy__ausBpIH8F8m0c3L8iMhktm_8aCgYKAbQSARESFQHGX2MiB14vsNpjFMoyjEcJ_ZYDJQ0171'
    },
});

// Function to send password reset email
const sendResetEmail = async (email, resetLink) => {
    try {
        // Send mail with defined transport object
        await transporter.sendMail({
            from: 'SureLog <crims21mailer@gmail.com>',
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Please click the following link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
        });

        console.log('Password reset email sent successfully.');
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
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

        "/api/register-user": async (req, res) => {
            const { email, password, firstName, middleName, lastName } = req.body;
            try {
                const userModel = await UserModel.findOne({ where: { email } });
                if (!userModel) {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const newUser = await UserModel.create({
                        email,
                        password: hashedPassword,
                        firstName,
                        middleName,
                        lastName
                    });
                    res.json({ status: "success", message: "User registered successfully", userId: newUser.userId }).send();
                } else {
                    res.json({ status: "userExists", message: "User already exists" }).send();
                }
            } catch (error) {
                console.error("Error in user registration: ", error);
                res.status(500).send("Error in user registration");
            }
        },

        "/api/authenticate-client": async (req, res) => {
            const { email, password } = req.body;
            try {
                const userModel = await UserModel.findOne({ where: { email } });
                if (userModel && await bcrypt.compare(password, userModel.password)) {
                    res.json({ userId: userModel.userId, status: "success" }).send();
                } else {
                    res.status(401).send("Invalid credentials");
                }
            } catch (error) {
                console.error("Error in authentication: ", error);
                res.status(500).send("Error in authentication");
            }
        },
        "/api/send-password-reset-email": async (req, res) => {
        const { email } = req.body;
        console.log("Sending password reset email to: ", email);

        try {
        const userModel = await UserModel.findOne({ where: { email } });
         
        if (userModel) {
            // Generate a reset token
            const resetTokenPayload = {
                userId: userModel.userId,
                email: userModel.email,
                expiration: Date.now() + 3600000, // 1 hour validity
            };
            const resetToken = jwt.sign(resetTokenPayload, '$3S$S10N$3CR3T');
            const resetLink = `http://localhost:3000/reset-password/${resetToken}`; 
            await sendResetEmail(email, resetLink);

            res.json({ status: "success", message: "Password reset email sent successfully" }).send();
        } else {
            res.json({ status: "userNotFound", message: "User not found" }).send();
        }
    } catch (error) {
        console.error("Error in sending password reset email: ", error);
        res.status(500).send("Error in sending password reset email");
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

        },

        "/api/check-master-user": async(req, res) => {
            console.log("Checking master user...");
            const {userId} = req.body;
            if(! userId) {
                res.json({
                    status: "userIdNotFound"
                }).send();
                return;
            }
            try{
                const master = await MasterModel.findOne({where: { userId: userId}});
                if(! master){
                    console.log(`Master user for User ID:${userId} was not found.`);
                    res.json({
                        status: "masterNotFound"
                    }).send();
                    return;
                }
                res.json({
                    status: "success"
                }).send();

            }catch(error){
                console.log("Error checking master user status: ", error);
                res.json({
                    status: 500
                }).send();
            }

        },

        "/api/fetch-tenants": async(req, res) => {
            console.log("Fetching tenants...");
            const {userId} = req.body;
            if(! userId) {
                res.json({
                    status: "userIdNotFound"
                }).send();
                return;
            }

            try {
                // Find the master by userId
                const master = await MasterModel.findOne({
                  where: { userId },
                  include: [
                    {
                      model: MasterRolePermissionModel,
                      attributes: ['masterId'],
                      include: [
                        {
                          model: TenantModel,
                          attributes: ['tenantId', 'name'], // You can specify the attributes you need from TenantModel
                        },
                      ],
                    },
                  ],
                });
              
                if (!master) {
                  console.log(`Master user with User ID:${userId} was not found.`);
                  res.json({
                    status: "masterNotFound"
                  }).send();
                  return;
                }

                console.log("Master: ", master);

                if(! master.MasterRolePermissionModels){
                    console.log("Master does not have any permission models");
                    res.json({
                        status: "roleNotFound"
                    }).send();
                    return;
                }
              
                // Extract tenant data from the master's role permissions
                const tenants = master.MasterRolePermissionModels.map((rolePermission) => {
                  return {
                    tenantId: rolePermission.TenantModel.tenantId,
                    name: rolePermission.TenantModel.name,
                  };
                });
              
                console.log("Sending tenants:", tenants);
              
                res.json({
                  status: "success",
                  tenants: JSON.stringify(tenants)
                }).send();
              } catch (error) {
                console.log("Error:", error);
                res.status(500).json({
                  status: "error"
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
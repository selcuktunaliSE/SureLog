const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const databaseService = require("../service/databaseService");
const { ResponseType } = require("../service/databaseService");
module.exports = {
    "post": {
        "/api/check-logged-in-status": async(req, res) => {
            res.status(200).json({status: 'success', isLoggedIn: req.session.loggedUser ? true : false});
        },
        "/api/fetch-all-masters": async (req, res) => {
          try {
              const databaseResponse = await databaseService.fetchAllMasters();
              if (databaseResponse.responseType === databaseService.ResponseType.Success) {
                  res.status(200).json({
                      status: "success",
                      masters: databaseResponse.data.masters
                  });
              } else {
                  res.status(404).json({
                      status: "error",
                      message: "Masters not found"
                  });
              }
          } catch (error) {
              console.error("Error fetching masters: ", error);
              res.status(500).json({
                  status: "error",
                  message: "Internal server error"
              });
          }
      },
      "/api/fetch-master-roles": async (req, res) => {
        try {
            const masterRoles = await databaseService.fetchMasterRoles(); // Implement this method in your database service
            res.status(200).json(masterRoles);
        } catch (error) {
            console.error('Error fetching master roles:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    
        "/api/fetch-all-users-last-login": async (req, res) => {
          try {
            console.log("You have come to lastlogin")
              const databaseResponse = await databaseService.fetchAllUsersLastLogin();
              if (databaseResponse.responseType === databaseService.ResponseType.Success) {
                  res.status(200).json({
                      status: "success",
                      usersLastLogin: databaseResponse.data
                  });
              } else {
                  res.status(500).json({
                      status: "error",
                      message: databaseResponse.data
                  });
              }
          } catch (error) {
              console.error("Error fetching all users' last login information: ", error);
              res.status(500).json({
                  status: "error",
                  message: "Internal server error"
              });
          }
      },
      
        "/api/delete-tenant": async (req, res) => {
          const { sourceUserId, tenantId } = req.body;
          console.log(`Deleting tenant with ID:${tenantId}`);
          try {
            const databaseResponse = await databaseService.deleteTenant(sourceUserId, tenantId);
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
            console.error("Error deleting tenant: ", error);
            res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
          }
        },

        "/api/delete-tenant-role": async(req, res) => {
          const { sourceUserId, tenantId, tenantRoleId } = req.body;
          console.log(`Deleting tenant role with ID:${tenantRoleId}`);
          try {
            const databaseResponse = await databaseService.deleteTenantRole(sourceUserId, tenantId, tenantRoleId);
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
            console.error("Error deleting tenant: ", error);
            res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
          }
        },

        "/api/get-user-role": async (req, res) => {
          const { userId } = req.body;
          // Input validation (ensure userId is provided)
          if (!userId) {
              return res.status(400).json({ status: "error", message: "User ID is required." });
          }

          try {
              const dbResponse = await databaseService.getUserRole(userId);

              // Handle the different types of responses
              if (dbResponse.responseType === databaseService.ResponseType.Success) {
                  return res.status(200).json({ status: "success", roleName: dbResponse.data.roleName });
              } else {
                  // Handle other types of responses (e.g., NotFound, Error) accordingly
                  return res.status(500).json({ status: "error", message: dbResponse.data });
              }
          } catch (error) {
              console.error("Error in /get-user-role-name:", error);
              return res.status(500).json({ status: "error", message: "Internal server error" });
          }
      },
        "/api/remove-user-from-tenant": async (req, res) => {
          const {sourceUserId, tenantId, targetUserId } = req.body;
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
            const {sourceUserId, email, password, firstName, middleName, lastName, tenantId, tenantRoleId } = req.body;
            console.log(`registering user with data: email:${email}, password:${password}, name:${firstName} ${middleName} ${lastName} to tenant:${tenantId} with tenant role ID:${tenantRoleId}`);
            try{
              const databaseResponse = await databaseService.registerUserToTenant(sourceUserId, {email, password, firstName, middleName, lastName, tenantId, tenantRoleId});
              if(databaseResponse.responseType === databaseService.ResponseType.Success){
                res.json({
                  status: "success",
                  userId: databaseResponse.data.userId,
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
         

        "/api/verify-token": async (req, res) => {
            try {
                const { token, secret } = req.body;
                console.log('Received Token from api:', token);
                const verified = speakeasy.totp.verify({
                    secret: secret,
                    encoding: 'base32',
                    token: token,
                    window: 1
                }); 
                console.log('Token Verification Result:', verified);
                if (verified) {
                    res.sendStatus(200);
                } else {
                    res.sendStatus(400);
                }
            } catch (error) {
                console.error('Error in /verify-token:', error);
                res.status(500).send('Internal Server Error');
            }
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

            

        },
        
        "/api/check-master-user": async(req, res) => {
            console.log("Checking master user...");
            const {userId} = req.body;
          
            try {
              const isUserMaster = databaseService.isUserMaster(userId);
              if (isUserMaster) {
                console.log("User is master")
                  res.json({ status: "success", data: { isUserMaster: isUserMaster } });
              } else {
                console.log("User is not master");
                  res.json({ status: "success", data: { isUserMaster: false } });
              }
          } catch (error) {
              console.log("Error checking master user status: ", error);
              res.status(500).json({ status: "error", message: "Internal Server Error" });
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
        },

        "/api/fetch-tenant-of-user": async(req, res) => {
          const{sourceUserId, targetUserId} = req.body;
          if(! sourceUserId || ! targetUserId){
            res.json({
                status: "accessDenied"
            }).send();
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
        "/api/fetch-user-role": async (req, res) => {
          const { tenantId, userId } = req.body;
          
          // Validate input
          if (!tenantId || !userId) {
              return res.status(400).json({ message: "Tenant ID and User ID are required." });
          }
      
          console.log(`Fetching role for user ID: ${userId} in tenant ID: ${tenantId}`);
          
          try {
              const databaseResponse = await databaseService.fetchUserRoleName(tenantId, userId);
              
              if (databaseResponse.responseType === databaseService.ResponseType.Success) {
                  res.json({
                      status: "success",
                      roleName: databaseResponse.data.roleName
                  });
              } else if (databaseResponse.responseType === databaseService.ResponseType.NotFound) {
                  res.status(404).send("Tenant or user not found");
              } else if (databaseResponse.responseType === databaseService.ResponseType.AccessDenied) {
                  res.status(403).send("Access denied");
              } else {
                  res.status(500).send("An error occurred while fetching the user role");
              }
          } catch (error) {
              console.error("Error fetching user role: ", error);
              res.status(500).send("Internal server error");
          }
      },
      

        "/api/fetch-user-profile": async (req, res) => {
            const {sourceUserId, targetUserId} = req.body;
            if(! sourceUserId || ! targetUserId){
                res.json({
                    status: "accessDenied"
                }).send();
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
        },

        "/api/fetch-tenant-roles-of-tenant" : async(req, res) => {
          
          const {sourceUserId, tenantId} = req.body;
          if(! sourceUserId || ! tenantId){
            res.status(505).send();
            return;
          }

          console.log(`Processing fetch tenant roles of tenant request for tenant: ${tenantId} for source user:${sourceUserId}`);

          try{
            const databaseResponse = await databaseService.fetchTenantRolesOfTenant(sourceUserId, tenantId);

            if(databaseResponse.responseType === databaseService.ResponseType.Success){
              res.json({
                status: "success",
                tenantRoles: databaseResponse.data.tenantRoles
              }).send();
            }
            else if(databaseResponse.responseType === databaseService.ResponseType.NotFound){
              res.status(404).send();
            }
            else if(databaseResponse.responseType === databaseService.ResponseType.AccessDenied){
              res.status(505).send();
            }
          }
         
          catch(error){
            console.error(`ERROR While fetchin tenant roles of tenant ID:${tenantId} for source user ID:${sourceUserId}`);
            res.status(500).send();
          }
        },

        "/api/fetch-total-number-of-users" : async (req, res) => {
          const {sourceUserId} = req.body;
          if(! sourceUserId){
            res.status(505).send();
            return;
          }

          console.log(`Processing fetch total number of users request for source user ID:${sourceUserId}`);

          try{
            const databaseResponse = await databaseService.fetchTotalNumberOfUsers(sourceUserId);
            
            if(databaseResponse.responseType === databaseService.ResponseType.Success){
              res.json({
                status: "success",
                totalNumberOfUsers: databaseResponse.data.totalNumberOfUsers
              }).send();
            }
            else if(databaseResponse.responseType === databaseService.ResponseType.NotFound){
              res.status(404).send();
            }
            else if(databaseResponse.responseType === databaseService.ResponseType.AccessDenied){
              res.status(505).send();
            }
          }
          catch(error){
            console.error(`ERROR While fetchin total number of users for source user ID:${sourceUserId}\nERROR${error}`);
            res.status(500).send();
          }
        },


        "/api/fetch-total-number-of-tenants": async (req, res) => {
          const {sourceUserId} = req.body;
          if(! sourceUserId){
            res.status(505).send();
            return;
          }

          console.log(`Processing fetch total number of tenants request for source user ID:${sourceUserId}`);

          try{
            const databaseResponse = await databaseService.fetchTotalNumberOfTenants(sourceUserId);
            
            if(databaseResponse.responseType === databaseService.ResponseType.Success){
              res.json({
                status: "success",
                totalNumberOfTenants: databaseResponse.data.totalNumberOfTenants
              }).send();
            }
            else if(databaseResponse.responseType === databaseService.ResponseType.NotFound){
              res.status(404).send();
            }
            else if(databaseResponse.responseType === databaseService.ResponseType.AccessDenied){
              res.status(505).send();
            }
          }
          catch(error){
            console.error(`ERROR While fetchin total number of tenants for source user ID:${sourceUserId}\nERROR:${error}`);
            res.status(500).send();
          }
        },



        "/api/fetch-user-type-count-distribution-data": async (req, res) => {
          const {sourceUserId} = req.body;
          if(! sourceUserId){
            res.status(505).send();
            return;
          }

          console.log(`Processing fetch user type distribution data request for source user ID:${sourceUserId}`);

          try{
            const databaseResponse = await databaseService.fetchUserTypeCountDistributionData(sourceUserId);
            
            if(databaseResponse.responseType === databaseService.ResponseType.Success){
              res.json({
                status: "success",
                userTypeCountDistributionData: databaseResponse.data.userTypeCountDistributionData
              }).send();
            }
            else if(databaseResponse.responseType === databaseService.ResponseType.NotFound){
              res.status(404).send();
            }
            else if(databaseResponse.responseType === databaseService.ResponseType.AccessDenied){
              res.status(505).send();
            }
          }
          catch(error){
            console.error(`ERROR While fetchin user type distribution data for source user ID:${sourceUserId}\nERROR:${error}`);
            res.status(500).send();
          }
        },

        "/api/fetch-total-number-of-masters": async (req, res) => {
          const {sourceUserId} = req.body;
          if(! sourceUserId){
            res.status(505).send();
            return;
          }

          console.log(`Processing fetch total number of masters request for source user ID:${sourceUserId}`);

          try{
            const databaseResponse = await databaseService.fetchTotalNumberOfMasters(sourceUserId);
            
            if(databaseResponse.responseType === databaseService.ResponseType.Success){
              res.json({
                status: "success",
                totalNumberOfMasters: databaseResponse.data.totalNumberOfMasters
              }).send();
            }
            else if(databaseResponse.responseType === databaseService.ResponseType.NotFound){
              res.status(404).send();
            }
            else if(databaseResponse.responseType === databaseService.ResponseType.AccessDenied){
              res.status(505).send();
            }
          }
          catch(error){
            console.error(`ERROR While fetchin total number of masters for source user ID:${sourceUserId}\nERROR:${error}`);
            res.status(500).send();
          }
        },
       
        "/api/get-activities": async (req, res) => {
          try {
              const databaseResponse = await databaseService.getActivities();
              console.log("You are here");
              if (databaseResponse.responseType === ResponseType.Success) {
                  res.status(200).json({
                      status: "success",
                      logs: databaseResponse.data.logs
                  });
              } else if (databaseResponse.responseType === ResponseType.NotFound) {
                  res.status(404).json({
                      status: "error",
                      message: "No logs found."
                  });
              } else {
                  res.status(500).json({
                      status: "error",
                      message: "Error fetching logs."
                  });
              }
          } catch (error) {
              console.error("Error in /api/get-activities:", error);
              res.status(500).json({
                  status: "error",
                  message: "Internal server error"
              });
          }
        },
        
          
        "/api/add-tenant": async (req, res) => {
          const { sourceUserId, tenantData } = req.body;
          if(! sourceUserId || ! tenantData){
            res.status(505).send();
            return;
          }
          console.log("Adding tenant with data:", tenantData);
          console.log("Source user ID:", sourceUserId);
          try {
              const databaseResponse = await databaseService.addTenant(sourceUserId, tenantData);
              
              if (databaseResponse.responseType === databaseService.ResponseType.Success) {
                  res.status(200).json({ 
                      status: "success",
                      message: "Tenant added successfully",
                      tenantId: databaseResponse.data.tenantId 
                  });
              } else if (databaseResponse.responseType === databaseService.ResponseType.AccessDenied) {
                  res.status(403).json({ 
                      status: "accessDenied",
                      message: "You do not have permission to add a tenant." 
                  });
              } else {
                  res.status(500).json({ 
                      status: "error",
                      message: databaseResponse.data 
                  });
              }
          } catch (error) {
              console.error("Error adding tenant: ", error);
              res.status(500).json({ 
                  status: "error",
                  message: "Internal server error" 
              });
          }
        },
      
        "/api/logout": async (req, res) => {
          const {userId} = req.body;
          console.log("Logout userid is ",userId);
          const logout = await databaseService.logout(userId);
          if(logout){
            res.status(200).json({status: "success"});
          }
          else{
            res.status(500).json({status: "error"});
          }
        },
        "/api/update-master": async (req, res) => {
          const masterData = req.body;
          const filteredMasterData = {
          userId: masterData.userId,
          masterId: masterData.masterId,
          assignMaster: masterData.assignMaster,
          revokeMaster: masterData.revokeMaster,
          addTenant: masterData.addTenant,
          addMasterRole: masterData.addMasterRole,
          editMasterRole: masterData.editMasterRole,
          deleteMasterRole: masterData.deleteMasterRole,
          assignMasterRole: masterData.assignMasterRole,
          revokeMasterRole: masterData.revokeMasterRole,
          };
          console.log("Masterdataapi:", filteredMasterData)
          try {
              // Here you will call your service to update the master details.
              // This is just a placeholder, implement your own logic here.
              const updateResult = await databaseService.updateMaster(filteredMasterData);
              if (updateResult.success) {
                  res.status(200).json({ status: "success", message: "Master updated successfully" });
              } else {
                  res.status(400).json({ status: "error", message: "Failed to update master" });
              }
          } catch (error) {
              console.error('Error updating master:', error);
              res.status(500).json({ status: "error", message: "Internal server error" });
          }
      },
        "/api/update-user": async (req, res) => {
          const { sourceUserId, userId, updatedUserData } = req.body;
          
          // Log the incoming data for debugging
          console.log("Updating user data:", updatedUserData);
      
          const response = await databaseService.updateUser(sourceUserId, userId, updatedUserData);
          
          if (response.responseType === databaseService.ResponseType.Success) {
              res.status(200).json({ status: "success", message: "User updated successfully", data: response.data });
          } else {
              res.status(400).json({ status: "error", message: response.data });
          }
        },
      
        "/api/update-tenant": async (req, res) => {
          const { sourceUserId, tenantId, updatedTenantData } = req.body;
          const response = await databaseService.updateTenant(sourceUserId, tenantId, updatedTenantData);
          res.status(response.responseType === databaseService.ResponseType.Success ? 200 : 400).json(response);
        },

        "/api/update-tenant-role": async(req, res) => {
          const { sourceUserId, tenantRoleId, tenantRoleData } = req.body;
          if(! sourceUserId || !tenantRoleId || ! tenantRoleData ){
            res.status(505).send();
            return;
          }
      
          const response = await databaseService.updateTenantRole(sourceUserId, tenantRoleId, tenantRoleData);
          
          if (response.responseType === databaseService.ResponseType.Success) {
              res.status(200).json({ status: "success" });
          } else {
              res.status(400).json({ status: "error"});
          }
        },

        "/api/generate-qrcode": async (req, res) => {
          try {
              const secret = speakeasy.generateSecret({ name:"SureLog" });
              const token = speakeasy.totp({
                  secret: secret.base32,
                  encoding: 'base32',
              });
              console.log('Generated TOTP Token:', token);
              qrcode.toDataURL(secret.otpauth_url, (err, data) => {
                  if (err) {
                      console.error('Error generating QR code:', err);
                      return res.status(500).send('Error generating QR code');
                  }
                  res.json({ qrCode: data, secret: secret.base32 });
              });
          } catch (error) {
              console.error('Error in /generate-qrcode:', error);
              res.status(500).send('Internal Server Error');
          }
      },

      "/api/add-tenant-role": async (req, res) => {
        const { sourceUserId, tenantRoleData } = req.body;
        if(!sourceUserId || ! tenantRoleData){
          res.status(503);
          return;
        }
          
        console.log("Adding new tenant role :", tenantRoleData);
    
        const response = await databaseService.addTenantRole(sourceUserId, tenantRoleData);
        
        if (response.responseType === databaseService.ResponseType.Success) {
            res.status(200).json({ status: "success"});
        } else {
            res.status(400).json({ status: "error", message: response.data });
        }
      }
      
    },
    
    "get": {
      
    }
}
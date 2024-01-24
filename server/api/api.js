const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const databaseService = require("../service/databaseService");

module.exports = {
    "post": {
        "/api/check-logged-in-status": async(req, res) => {
            res.status(200).json({status: 'success', isLoggedIn: req.session.loggedUser ? true : false});
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
        // File: api.js (or wherever you define your routes)

"/api/add-tenant": async (req, res) => {
  const { sourceUserId, tenantData } = req.body;
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
        "/api/update-user": async (req, res) => {
          const { sourceUserId, userId, updatedUserData } = req.body;
          
          // Log the incoming data for debugging
          console.log("Updating user data:", updatedUserData);
      
          const response = await databaseService.updateUser(sourceUserId, userId, updatedUserData);
          
          if (response.responseType === databaseService.ResponseType.Success) {
            console.log("Api side : ",response);
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
      
    },
    
    "get": {
      
    }
}
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
        }


    },
    
    "get": {
        
    }
}
const {UserModel, TenantModel, TenantUserModel} = require('../models');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');


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

        "/api/fetch-tenant-roles": async(req, res) => {
            console.log("Tenant roles fetch request received...");
            const {userId} = req.body;

            try{
                const tenantRoles = await TenantUserModel.findAll({ where : { userId }});

                if(tenantRoles && tenantRoles.length > 0){
                    console.log("tenant roles list : ", tenantRoles);
                    res.json({
                        status: "success",
                        tenantRoles: tenantRoles,
                    }).send();
                }else{
                    res.json({status: 404})
                    .send();
                }
            }
            catch(error){
                console.error("Error fetching tenant roles: ", error);
                res.json({
                    status:500
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
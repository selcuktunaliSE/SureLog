const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const crypto = require('crypto');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');

const sessionConfig = require('./config/sessionConfig.json');
const envConfig = require('./config/envConfig.json');


const getDynamicSecretKeyForUser = (user) => {
    const secretKeyLength = 6; 
    return crypto.randomInt(0, Math.pow(10, secretKeyLength)).toString();
};

const sessionStoreMySQLOptions = {
    database: sessionConfig.sessionStore.database,
    user: sessionConfig.sessionStore.user,
    password: sessionConfig.sessionStore.password,
    host: sessionConfig.sessionStore.host,
    port: sessionConfig.sessionStore.port,
    clearExpired: sessionConfig.sessionStore.clearExpired, // Automatically remove expired sessions
    checkExpirationInterval: sessionConfig.sessionStore.checkExpirationInterval, // How often expired sessions are checked (in milliseconds)
    expiration: sessionConfig.sessionStore.expiration, // Session expiration time (in milliseconds)
}
console.log("ENV: ", process.env.NODE_ENV);

const sessionCookie = process.env.NODE_ENV == "development" ? {
    secure: false,
    httpOnly: false,
    sameSite: "lax",
    maxAge: 10368000000, // 2 days in milliseconds
    path : "/"
} : {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 10368000000, // 2 days in milliseconds
    path : "/"
}

const sessionStore = new MySQLStore(sessionStoreMySQLOptions);

const sessionOptions = {
    name: "user-session",
    secret : sessionConfig.secret,
    proxy: false,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {...sessionCookie}
}

const db = require("./models");
const {user} = require('./models');
const { Server } = require('http');
const app = express();


app.use(express.static(path.join(__dirname, '../clientbuild')));


app.use(cors({
    origin: "http://localhost:3001",
    credentials: true,
    allowedHeaders: "X-PINGOTHER, Content-Type",   
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
})); // Enable CORS
app.use(bodyParser.json());
app.use(session(sessionOptions));



// Handle login form submission
app.post('/api/authenticate-client', async (req, res) => {

    console.log("Authentication request received...");

    if(req.session.loggedUser)
    {
        res.status(200).json({status: 'success', message: 'Already logged in'});
    }
    
    const { email, password } = req.body;
    try {
        const userModel = await user.findOne({ where: { email, password } });
        if (userModel) {
            const dynamicSecretKey = getDynamicSecretKeyForUser(userModel);
            console.log(`Dynamic secret key for ${userModel.email}: ${dynamicSecretKey}`);
            const payload = { userId: userModel.userId, email: userModel.email };
            const token = jwt.sign(payload, dynamicSecretKey, { expiresIn: '5m' });
            req.session.loggedUser = {
                email : userModel.email,
                userId : userModel.userId,
                role : userModel.role,
                tenantId : userModel.tenantId
            }
            await req.session.save();
            console.log(req.session); 
            res.json({
                "userId": req.session.loggedUser.userId,
                "status" : "success"
            })
            .send();
            
        } else {
            console.log("Login failed due to invalid credentials.");
            res.json({ 
                status: "invalidCredentials",
                message: 'Login failed due to invalid credentials.'})
                .send();
        }
    } catch (error) {
        console.error("Error logging in: ", error);
        res.json({ status: 500, message: 'Error logging in' }.send());
    }
});

app.post('/api/checkLoggedInStatus', async(req, res)=> {
    console.log("client request cookies: ", req.cookies);
    console.log(req.sessionID);
    console.log(req.session);
    res.status(200).json({status: 'success', isLoggedIn: req.session.loggedUser ? true : false});
}); 

app.post('/api/registerUser', async (req,res) => {
    const {email, password, firstName, middleName, lastName} = req.body;
    try{
        const userModel = await user.findOne({where: {email}});
        if(! userModel){
            const newUser = await user.create({
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

    
})

app.get('/api/getUserDetails', async (req, res) => {
    const {userId} = req.query;
    console.log("Fetching user details for userId: ", userId);
    try {
        const userModel = await user.findOne({ where: { userId } });
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
});


db.sequelize.sync().then((req) => {
    var httpPort = process.env.NODE_ENV == "dev" ?
        envConfig.environments.dev.httpPort :
        envConfig.environments.production.httpPort;

    app.listen(httpPort, () => console.log('Server running on http://localhost:', httpPort));
});

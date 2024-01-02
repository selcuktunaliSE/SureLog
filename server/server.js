const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const crypto = require('crypto');
const MySQLStore = require('express-mysql-session')(session);

const sessionConfig = require('./config/sessionConfig.json');
const envConfig = require('./config/envConfig.json');


const getDynamicSecretKeyForUser = (user) => {
    const secretKeyLength = 6; // You can adjust the length as needed
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
    sameSite: "lax",
    maxAge: 10368000000 // 2 days in milliseconds
} : {
    secure: true,
    sameSite: "none",
    maxAge: 10368000000 // 2 days in milliseconds
}

const sessionStore = new MySQLStore(sessionStoreMySQLOptions);

const sessionOptions = {
    name: "user-session",
    secret : sessionConfig.secret,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {...sessionCookie}
}

const db = require("./models");
const {user} = require('./models');
const { Server } = require('http');
const app = express();

app.use(cors()); // Enable CORS
app.use(bodyParser.json());
app.use(session(sessionOptions));

// Maintain a list of revoked tokens
const revokedTokens = new Set(); 

// Handle login form submission
app.post('/api/authenticate-client', async (req, res) => {

    console.log(req.session);

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
            req.session.save();
            console.log(req.session);   
            res.status(200).json(req.session);
            
        } else {
            console.log("Login failed due to invalid credentials.");
            res.json({ status: 'invalidCredentials', message: 'Invalid credentials!' });
        }
    } catch (error) {
        console.error("Error logging in: ", error);
        res.status(500).json({ status: 'error', message: 'Error logging in' });
    }
});

app.get('/api/checkLoggedInStatus', async(req, res)=> {
    console.log(req.sessionID);
    console.log(req.session);
    res.status(200).json({status: 'success', isLoggedIn: req.session.loggedUser ? true : false});
}); 



db.sequelize.sync().then((req) => {
    var httpPort = process.env.NODE_ENV == "dev" ?
        envConfig.environments.dev.httpPort :
        envConfig.environments.production.httpPort;

    app.listen(httpPort, () => console.log('Server running on http://localhost:', httpPort));
});

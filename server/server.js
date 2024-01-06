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
const { Server } = require('http');
const app = express();
const api = require('./api/api');


app.use(express.static(path.join(__dirname, '../clientbuild')));

app.use(cors({
    origin: "http://localhost:3001",
    credentials: true,
    allowedHeaders: "X-PINGOTHER, Content-Type",   
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
})); // Enable CORS
app.use(bodyParser.json());
app.use(session(sessionOptions));

Object.keys(api.post).forEach(apiFunctionName => app.post(apiFunctionName, api.post[apiFunctionName]));
Object.keys(api.get).forEach(apiFunctionName => app.get(apiFunctionName, api.get[apiFunctionName]));



db.sequelize.sync().then((req) => {
    var httpPort = process.env.NODE_ENV == "dev" ?
        envConfig.environments.dev.httpPort :
        envConfig.environments.production.httpPort;

    app.listen(httpPort, () => console.log('Server running on http://localhost:', httpPort));
});

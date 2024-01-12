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
const corsConfig = require("./config/corsConfig.json");


const getDynamicSecretKeyForUser = (user) => {
    const secretKeyLength = 6; 
    return crypto.randomInt(0, Math.pow(10, secretKeyLength)).toString();
};

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

const sessionStore = new MySQLStore(sessionConfig.sessionStore);

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
const app = express();
const api = require('./api/api');


app.use(express.static(path.join(__dirname, '../clientbuild')));

app.use(cors(corsConfig.settings)); // Enable CORS
app.use(bodyParser.json());
app.use(session(sessionOptions));

Object.keys(api.post).forEach(apiFunctionName => app.post(apiFunctionName, api.post[apiFunctionName]));
Object.keys(api.get).forEach(apiFunctionName => app.get(apiFunctionName, api.get[apiFunctionName]));



db.sequelize.sync().then((req) => {
    var httpPort = process.env.NODE_ENV == "development" ?
        envConfig.environments.development.httpPort :
        envConfig.environments.production.httpPort;

    app.listen(httpPort, () => console.log('Server running on http://localhost:', httpPort));
});

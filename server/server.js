const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const sessionConfig = require('./config/sessionConfig.json');
const envConfig = require('./config/envConfig.json');
const corsConfig = require("./config/corsConfig.json");
const databaseService = require("./service/databaseService");

const cert = fs.readFileSync("./ssl/certs/ikd_net_tr_e4c64_0b723_1737742492_681ef14f7c4aaa9c77662e67ff9c482e.crt");
const key = fs.readFileSync("./ssl/keys/e4c64_0b723_c336815b48b87347b70af05421ace2b7.key");

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
    databaseService.initialize();

    var httpPort = process.env.NODE_ENV == "development" ?
        envConfig.environments.development.httpPort :
        envConfig.environments.production.httpPort;

    https.createServer({
        cert: cert,
        key: key,
    }, app).listen(httpPort, () => {
        console.log('Server running on http://localhost:', httpPort)
    });

/*     app.listen(httpPort, () => console.log('Server running on http://localhost:', httpPort));
 */});

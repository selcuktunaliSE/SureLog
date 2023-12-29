const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const crypto = require('crypto');

const sequelize = new Sequelize('multitenantDB', 'root', 'root', {
    host: 'localhost',
    port: '3306',
    dialect: 'mysql'
});

const getDynamicSecretKeyForUser = (user) => {
    const secretKeyLength = 6; // You can adjust the length as needed
    return crypto.randomInt(0, Math.pow(10, secretKeyLength)).toString();
};

const User = require('./src/models/user'); // Adjust this path as necessary
const { Server } = require('http');
const app = express();

app.use(cors()); // Enable CORS
app.use(bodyParser.json());
app.use(session({
    secret : getDynamicSecretKeyForUser(),
    resave: false,
    saveUninitialized: true
}));

// Maintain a list of revoked tokens
const revokedTokens = new Set(); 

// Handle login form submission
app.post('/api/authenticate-client', async (req, res) => {
    
    console.log("authentication request received...");

    if(req.session.loggedUser)
    {
        res.status(200).json({status: 'success', message: 'Already logged in'});
    }

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email, password } });
        if (user) {
            // Retrieve or generate a unique secret key for the user or tenant
            const dynamicSecretKey = getDynamicSecretKeyForUser(user);
            console.log(`Dynamic secret key for ${user.email}: ${dynamicSecretKey}`);
            const payload = { userId: user.userId, email: user.email };
            const token = jwt.sign(payload, dynamicSecretKey, { expiresIn: '5m' });

            res.json({ status: 'success', message: 'Login Successful!', token });
            req.session.loggedUser = {
                email : user.email,
                userId : user.userId,
                role : user.role,
                tenantId : user.tenantId
            }
        } else {
            res.json({ status: 'error', message: 'Invalid credentials!' });
        }
    } catch (error) {
        console.error("Error logging in", error);
        res.status(500).json({ status: 'error', message: 'Error logging in' });
    }
});

app.post('/api/checkLoggedInStatus', async(req, res)=> {
    res.json({status: 'success', isLoggedIn: req.session.loggedUser ? true : false});
}); 




app.listen(9000, () => console.log('Server running on http://localhost:9000'));
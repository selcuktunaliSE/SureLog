const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const session = require('session');


// Sequelize setup
const sequelize = new Sequelize('multitenantDB', 'root', 'root', {
    host: 'localhost',
    port: '3306',
    dialect: 'mysql'
});

const User = require('./src/models/user'); // Adjust this path as necessary
const { Server } = require('http');
const app = express();

app.use(cors()); // Enable CORS
app.use(bodyParser.json());
app.use(session({
    secret : '0', // TODO implement secret token generation
    resave: false,
    saveUninitialized: true
}))

// Maintain a list of revoked tokens
const revokedTokens = new Set(); 

// Handle login form submission
app.post('/login', async (req, res) => {

    fetch('/api/authenticate-client')
        .then((response) => response.json())
        .then((data) => {
            if(data.status === 'success' && ! data.isLoggedIn)
            {

            }
        })
    
});

// Handle logout (invalidate the token)
app.post('/logout', (req, res) => {
    const token = req.body.token;
    revokedTokens.add(token); // Add the token to the list of revoked tokens
    res.json({ status: 'success', message: 'Logout Successful!' });
});

// Protected route example
app.get('/protected', (req, res) => {
    const token = req.headers.authorization;

    if (revokedTokens.has(token)) {
        res.status(401).json({ status: 'error', message: 'Token is revoked' });
    } 
    else {
        jwt.verify(token, dynamicSecretKey, (err, decoded) => {
            if (err) {
                res.status(401).json({ status: 'error', message: 'Invalid token' });
            } 
            else {
                res.json({ status: 'success', message: 'Access granted', user: decoded });
            }
        });
    }
});

const getDynamicSecretKeyForUser = (user) => {
    const secretKeyLength = 6; // You can adjust the length as needed
    return crypto.randomInt(0, Math.pow(10, secretKeyLength)).toString();
};

const authenticateUserFromServer = ({email, password}) => 
{
    axios.post('http://localhost:/someEndpoint', userData)
        .then((response) => {
            console.log('Server response:', response.data);
        })
        .catch((error) => {
            console.error('Error sending data to server:', error);
        });
};

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Sequelize setup
const sequelize = new Sequelize('multitenantDB', 'root', 'root', {
    host: 'localhost',
    port: '8889',
    dialect: 'mysql'
});

const User = require('./loginapp/models/user'); // Adjust this path as necessary
const app = express();

app.use(cors()); // Enable CORS
app.use(bodyParser.json());

// Maintain a list of revoked tokens
const revokedTokens = new Set();

// Handle login form submission
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email, password } });
        if (user) {
            // Retrieve or generate a unique secret key for the user or tenant
            const dynamicSecretKey = getDynamicSecretKeyForUser(user);
            console.log(`Dynamic secret key for ${user.email}: ${dynamicSecretKey}`);
            const payload = { userId: user.id, email: user.email };
            const token = jwt.sign(payload, dynamicSecretKey, { expiresIn: '5m' });

            res.json({ status: 'success', message: 'Login Successful!', token });
        } else {
            res.json({ status: 'error', message: 'Invalid credentials!' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error logging in' });
    }
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
    } else {
        jwt.verify(token, dynamicSecretKey, (err, decoded) => {
            if (err) {
                res.status(401).json({ status: 'error', message: 'Invalid token' });
            } else {
                res.json({ status: 'success', message: 'Access granted', user: decoded });
            }
        });
    }
});

const getDynamicSecretKeyForUser = (user) => {
    const secretKeyLength = 6; // You can adjust the length as needed
    return crypto.randomInt(0, Math.pow(10, secretKeyLength)).toString();
};

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

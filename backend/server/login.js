const express = require('express');
const { spawn } = require('child_process');
const axios = require("axios");
const fs = require('fs');
const path = require('path');
const router = express.Router();
const db = require('./db'); 
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('326160157051-sulsasmu3q4p8ro3elbaas9b0ci9mokr.apps.googleusercontent.com');
// import dishes from './dishes';
const tempInputDataPath = path.join(__dirname, '../../cuchina/rating.csv');
const tempDishDataPath = path.join(__dirname, '../../cuchina/dish.csv');
const nodecallspython = require("node-calls-python");

const jwt = require('jsonwebtoken'); // Import JWT library
const secretKey = '1191820114';

router.post('/google-login', async (req, res) => {
    const token = req.body.token;  // Extract the token from the body
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '326160157051-sulsasmu3q4p8ro3elbaas9b0ci9mokr.apps.googleusercontent.com', // Ensure this matches your client ID
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;
        // console.log(ticket);

        // Check if the email already exists in the database
        const checkQuery = 'SELECT * FROM users WHERE email = ?';
        db.query(checkQuery, [email, googleId], (checkErr, result) => {  // Pass googleId too in the query
            if (checkErr) {
                console.error('Error checking email existence:', checkErr);
                return res.status(500).json({ error: 'Database error' });
            }
            if (result.length > 0) {
                const userId = result[0].user_id;
                const updateQuery = `
                    UPDATE users 
                    SET last_login = NOW() 
                    WHERE email = ? 
                `;
                db.query(updateQuery, [email, googleId], (updateErr, updateResult) => {
                    if (updateErr) {
                        console.error('Error updating last_activity:', updateErr);
                        return res.status(500).json({ error: 'Failed to update last activity' });
                    }
                    const userId = updateResult.insertId;
                    res.status(201).json({
                        message: 'Account created successfully!',
                        user_id: userId // Send the token to the client
                    });
                });
                
            } else {
                const insertQuery = `
                    INSERT INTO users (google_ email, name, last_login, created_at) 
                    VALUES (?, ?, ?, NOW(), NOW())
                `;
                db.query(insertQuery, [googleId, email, name], (insertErr, insertResult) => {
                    if (insertErr) {
                        console.error('Error inserting Google login data:', insertErr);
                        return res.status(500).json({ error: 'Failed to save Google login details' });
                    }
                    const userId = insertResult.insertId;
                    res.status(201).json({
                        message: 'Account created successfully!',
                        user_id: userId // Send the token to the client
                    });
                });
            }
        });
    } catch (error) {
        console.error('Error verifying Google token:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});


router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username/email and password are required' });
    }

    const checkQuery = 'SELECT * FROM users WHERE name = ? AND password = ?';

    db.query(checkQuery, [username, password], (checkErr, result) => {
        if (checkErr) {
            console.error('Error checking user existence:', checkErr);
            return res.status(500).json({ error: 'Database error' });
        }

        if (result.length > 0) {
            // User exists
            const user = result[0];
            const userId = user.user_id;
            const pythonScriptPath = path.join(__dirname, '../../cuchina/collaborative_filter.py');
            (async () => {
                try {
                    const result = await runPythonScript(pythonScriptPath,userId);
                    // decoded_data = jwt.verify(req.body.token, secretKey);
                    console.log('finalu',result);
                    res.status(201).json({
                        message: 'Survey is Submitted',
                        user_id: userId, // Send the token to the client
                        collaborative_filter: result // Send the token to the client
                    });
                } catch (err) {
                    console.error('Error while executing Python script:', err.message);
                }
            })();
        } else {
            // User does not exist
            return res.status(400).json({ error: 'Username/Email and Password do not match' });
        }
    });
});

router.post('/create-account', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    const checkQuery = 'SELECT * FROM users WHERE name = ?';
    db.query(checkQuery, [username], (checkErr, result) => {
        if (checkErr) {
            console.error('Error checking user existence:', checkErr);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const insertQuery = `
            INSERT INTO users (name, password, created_at, last_login) 
            VALUES (?, ?, NOW(), NOW())
        `;
        db.query(insertQuery, [username, password], (insertErr, insertResult) => {
            if (insertErr) {
                console.error('Error creating account:', insertErr);
                return res.status(500).json({ error: 'Failed to create account' });
            }

            const userId = insertResult.insertId;

            // Generate a JWT token
            // const token = jwt.sign({ user_id: userId }, secretKey, { expiresIn: '1h' });
            res.status(201).json({
                message: 'Account created successfully!',
                user_id: userId
            });
        });
    });
});

function runPythonScript(pythonScriptPath,user_id) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', ['-u', pythonScriptPath, user_id]);

        let output = '';
        let error = '';
        // Collect data from the Python script
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        // Collect error messages from the Python script
        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        // Resolve or reject the promise based on process exit code
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(output.trim());
            } else {
                reject(new Error(`Python script exited with code ${code}: ${error.trim()}`));
            }
        });

        pythonProcess.on('error', (err) => {
            reject(new Error(`Failed to start Python script: ${err.message}`));
        });
    });
}

module.exports = router;

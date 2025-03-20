const { spawn } = require('child_process');
const express = require('express');
const router = express.Router();
const db = require('./db');
// const authenticateToken = require('./authenticaiton');
const fs = require('fs');
const path = require('path');
const tempInputDataPath = path.join(__dirname, 'inputData.json');
const tempDishDataPath = path.join(__dirname, 'dishData.json');

router.post('/post_answers', (req, res) => {
    const user_id = req.body.user_id;
    if (!user_id) {
        return res.status(401).json({ error: 'User not logged in or token invalid' });
    }

    const {
        // ageGroup,
        preferred_meat,
        vegetarian_meat,
        allergies,
        sweet_tooth,
        spice_level,
        // favoriteDrink,
        healthy_or_calorie_heavy,
    } = req.body.answers;

    if (
        !preferred_meat || !vegetarian_meat || !allergies ||
        !sweet_tooth || !spice_level || !healthy_or_calorie_heavy
    ) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    console.log(req.body.answers);

    const query = `
        INSERT INTO survey (
            user_id, meat, diet, allergies, sweet_tooth, spiciness, meal_type
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const meatString = preferred_meat.join(', ');
    const dietString = vegetarian_meat.join(', ');
    const allergiesString = allergies.join(', ');

    db.query(
        query,
        [
            user_id,
            meatString,
            dietString,
            allergiesString,
            sweet_tooth,
            spice_level,
            // favoriteDrink,
            healthy_or_calorie_heavy,
        ],
        (err, result) => {
            if (err) {
                console.error('Error saving survey answers:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            let dish_data ;
            const dish_query = `SELECT * FROM dishes`;
            db.query(dish_query, (err, result) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    // console.log('result',result);
                    dish_data = result;
                

                // Prepare input for data.py as a JSON string
                const inputData = {
                    preferred_meat,
                    vegetarian_meat,
                    allergies,
                    sweet_tooth,
                    spice_level,
                    // favoriteDrink,
                    healthy_or_calorie_heavy,
                };
                fs.writeFileSync(tempInputDataPath, JSON.stringify(inputData));
                fs.writeFileSync(tempDishDataPath, JSON.stringify(dish_data));
                // Execute data.py and pass survey data via arguments
                const pythonScriptPath = path.join(__dirname, '../../cuchina/data.py');
                (async () => {
                    try {
                        const result = await runPythonScript(pythonScriptPath);
                        // decoded_data = jwt.verify(req.body.token, secretKey);
                        console.log('finalu',result);
                        res.status(201).json({
                            message: 'Survey is Submitted',
                            content_based_filter: result // Send the token to the client
                        });
                    } catch (err) {
                        console.error('Error while executing Python script:', err.message);
                    }
                })();
            });
        }
    );
});

function runPythonScript(pythonScriptPath) {
    return new Promise((resolve, reject) => {
        console.log('true')
        const pythonProcess = spawn('python', ['-u', pythonScriptPath]);

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

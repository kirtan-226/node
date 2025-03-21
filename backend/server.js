const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const loginRoutes = require('./server/login');
const itemRoutes = require('./server/item');
const orderRoutes = require('./server/order');
const surveyRoutes = require('./server/survey');
const dishRoutes = require('./server/dishes');

// Initialize the Express app
const app = express();

// CORS configuration
app.use(cors({
    credentials: true, // Allows cookies to be sent and received from a different domain
}));

// Middleware to parse JSON
app.use(bodyParser.json());

// Define routes
app.use('/api/login', loginRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/item', itemRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/dish', dishRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on https://15.207.254.20:${PORT}`);
});

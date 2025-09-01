const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');

dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in the .env file!');
    process.exit(1);
}

const app = express();

app.use(express.static('public'));
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);

// Corrected Route: This will serve the login page when a user visits the root URL
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route for the login page
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// New route for the signup page
app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Route for the product catalog
app.get("/products", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT} 🎉`));
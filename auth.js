const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Make sure you have a User model in ../models
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// @route   POST /api/auth/register
// @desc    Register user & send OTP
// @access  Public
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Generate and hash OTP
        const otp = crypto.randomBytes(3).toString('hex').toUpperCase();
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        // Create a new user instance, but do not save it yet
        user = new User({
            username,
            email,
            password,
            otp: hashedOtp,
            otpExpires: Date.now() + 3600000 // OTP expires in 1 hour
        });

        // Hash the user's password
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;

        // Send the OTP via email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification OTP',
            html: `<h1>Your OTP for verification is:</h1><h2>${otp}</h2>`
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ msg: 'Failed to send OTP email' });
            } else {
                // Save the user with the hashed password and OTP
                await user.save();
                console.log('Email sent:', info.response);
                return res.status(200).json({ msg: 'OTP sent to email' });
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and activate user
// @access  Public
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(otp, user.otp);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        // Check if OTP has expired
        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'OTP has expired' });
        }

        // Set user to active (optional, based on your User model)
        // user.isVerified = true;
        // user.otp = undefined;
        // user.otpExpires = undefined;
        // await user.save();

        res.json({ msg: 'Email verified successfully!' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
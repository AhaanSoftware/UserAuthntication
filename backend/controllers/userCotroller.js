const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { generateOtp, sendOtp } = require('../utils/otpService'); // Utility functions for OTP

// Email Validation Function
const validateEmail = (email) => {
    
    if (!email || !email.includes('@')) {
        throw new Error('Please provide a valid email address');
    }
};
const generateAccessToken = (user) => {    
    return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
};


const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, phoneno } = req.body;

    try {
        // Validate email
        validateEmail(email);

        // Check for required fields
        if (!firstName || !lastName || !email || !password || !phoneno) {
            return res.status(400).json({ msg: 'Please provide all required fields' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }

        // Create a new User instance
        const user = new User({
            firstName,
            lastName,
            email,
            password, // Assuming the password will be hashed before saving (using middleware)
            phoneno,
        });

        // Send OTP to mobile number
        const otp = generateOtp(); // This function will generate a random OTP
        await sendOtp(phoneno, otp);  // Send OTP via an SMS service (e.g., Twilio)

        // Save OTP and expiration in the database
        user.otp = otp;
        user.otpExpiration = Date.now() + 10 * 60 * 1000;  // OTP expires in 10 minutes

        // Save the user to the database
        await user.save();

        res.status(201).json({
            msg: 'User registered successfully. OTP sent to mobile number.',
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Email and password are required' });
    }

    try {
        // Find user by email (case-insensitive)
        const user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Compare the entered password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password); // Assuming `user.password` is hashed
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = generateAccessToken(user);

        // Send the token in the response
        res.status(200).json({ token, msg: 'Login successful' });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = { registerUser, loginUser  };

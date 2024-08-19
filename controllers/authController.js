const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const config = require('../config/config');

// Configure nodemailer with SMTP settings from config
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: true, // true for 465, false for 587
  auth: {
    user: config.smtp.auth.user,
    pass: config.smtp.auth.pass,
  },
});

// Register a new user
exports.register = async (req, res) => {
    const { firstname, lastname, email, phoneNumber, password } = req.body;
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash the user's password
      const hashedPassword = await bcrypt.hash(password, 12);
  
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Create a new user and save it with the OTP and OTP expiry time
      const user = new User({
        firstname,
        lastname,
        email,
        phoneNumber,
        password: hashedPassword,
        otp: otp,
        otpExpiry: Date.now() + 15 * 60 * 1000 // OTP expiry time set to 15 minutes
      });
  
      await user.save();
  
      // Send OTP to the user's email
      await transporter.sendMail({
        from: `"Support" <${config.smtp.auth.user}>`,
        to: email,
        subject: 'Account Verification OTP',
        text: `Your OTP for account verification is ${otp}. It is valid for 15 minutes.`,
      });
  
      res.status(201).json({ message: 'User registered successfully! OTP sent to your email.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

// Verify OTP for registration
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the OTP is valid and has not expired
      if (user.otp !== otp || user.otpExpiry < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
  
      // Mark the user as verified
      user.otp = undefined;  // Clear OTP
      user.otpExpiry = undefined;  // Clear OTP expiry
      user.isVerified = true;  // Add isVerified field if it doesn't exist yet
      await user.save();
  
      res.status(200).json({ message: 'Account verified successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

// Login a user
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, config.jwt.secret, { expiresIn: '1h' });
  
      // Send response with token and user details
      res.status(200).json({
        token,
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

// Forgot password (send OTP)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 15 * 60 * 1000; // OTP expires in 15 minutes
    await user.save();

    await transporter.sendMail({
      from: `"Support" <${config.smtp.auth.user}>`,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}. It is valid for 15 minutes.`,
    });

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify OTP for forgot password
exports.verifyForgotPasswordOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (user.otp !== otp || user.otpExpiry < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
  
      // Clear OTP and mark as verified for password reset
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
  
      res.status(200).json({ message: 'OTP verified successfully! You can now reset your password.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

// Reset password
exports.resetPassword = async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if passwords match
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }
  
      // Reset the password
      user.password = await bcrypt.hash(password, 12);
      await user.save();
  
      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
const Admin = require('../models/Admin');
const LoanOfficer = require('../models/LoanOfficer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Admin registration
exports.registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the email is already registered
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Create a new admin
    admin = new Admin({ name, email, password });
    await admin.save();

    // Generate JWT token
    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Admin login
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      message: 'Admin logged in successfully',
      token,
      user: {
        name: admin.name,
        email: admin.email,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Register a new loan officer
exports.addLoanOfficer = async (req, res) => {
  try {
      const { name, email, phone, password } = req.body;

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new loan officer
      const newLoanOfficer = new LoanOfficer({
          name,
          email,
          phone,
          password: hashedPassword, // Save the hashed password
      });

      // Save the loan officer to the database
      await newLoanOfficer.save();

      res.status(201).json({
          message: 'Loan officer added successfully',
          loanOfficerId: newLoanOfficer._id,
      });
  } catch (error) {
      res.status(500).json({ message: 'Error adding loan officer', error });
  }
};
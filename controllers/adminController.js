const Admin = require('../models/Admin');
const LoanOfficer = require('../models/LoanOfficer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    admin = new Admin({ name, email, password });
    await admin.save();

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

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

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

exports.addLoanOfficer = async (req, res) => {
  try {
      const { name, email, phone, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newLoanOfficer = new LoanOfficer({
          name,
          email,
          phone,
          password: hashedPassword, 
      });

      await newLoanOfficer.save();

      res.status(201).json({
          message: 'Loan officer added successfully',
          loanOfficerId: newLoanOfficer._id,
      });
  } catch (error) {
      res.status(500).json({ message: 'Error adding loan officer', error });
  }
};
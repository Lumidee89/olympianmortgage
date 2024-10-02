// controllers/loanOfficerController.js
const LoanOfficer = require('../models/LoanOfficer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config'); // Assuming you have a config file for your JWT secret

// Loan officer login method
exports.loginLoanOfficer = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find loan officer by email
        const loanOfficer = await LoanOfficer.findOne({ email });
        if (!loanOfficer) {
            return res.status(404).json({ message: 'Loan officer not found' });
        }

        // Compare the password with the hashed password
        const isMatch = await bcrypt.compare(password, loanOfficer.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create and assign a token
        const token = jwt.sign({ loanOfficerId: loanOfficer._id }, config.jwt.secret, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Loan officer logged in successfully',
            token,
            loanOfficerId: loanOfficer._id,
            user: {
                name: loanOfficer.name,
                email: loanOfficer.email,
              }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

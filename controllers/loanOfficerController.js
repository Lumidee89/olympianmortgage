const LoanOfficer = require("../models/LoanOfficer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

exports.loginLoanOfficer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const loanOfficer = await LoanOfficer.findOne({ email });
    if (!loanOfficer) {
      return res.status(404).json({ message: "Loan officer not found" });
    }
    const isMatch = await bcrypt.compare(password, loanOfficer.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { loanOfficerId: loanOfficer._id },
      config.jwt.secret,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Loan officer logged in successfully",
      token,
      loanOfficerId: loanOfficer._id,
      user: {
        name: loanOfficer.name,
        email: loanOfficer.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

// Ibrahim
exports.getAllLoanOfficers = async (req, res) => {
  try {
    const loanOfficers = await LoanOfficer.find({}, "-password");
    res.status(200).json({
      message: "Loan officers retrieved successfully",
      data: loanOfficers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching loan officers",
      error,
    });
  }
};

exports.getLoanOfficerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Loan officer ID is required" });
    }

    const loanOfficer = await LoanOfficer.findById(id).select("name email");

    if (!loanOfficer) {
      return res.status(404).json({ error: "Loan officer not found" });
    }

    res.status(200).json(loanOfficer);
  } catch (error) {
    console.error("Error fetching loan officer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const Admin = require("../models/Admin");
const LoanOfficer = require("../models/LoanOfficer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Loan = require("../models/LoanApplication");
const config = require("../config/config");
const User = require("../models/User");

exports.registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    admin = new Admin({ name, email, password });
    await admin.save();

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "Admin registered successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        adminId: admin._id,
        role: "admin",
      },
      config.jwt.secret || process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
      message: "Loan officer added successfully",
      loanOfficerId: newLoanOfficer._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding loan officer", error });
  }
};

exports.getLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate("userId", "name email");

    res.status(200).json({
      message: "Loans retrieved successfully",
      loans,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Ibrahim

exports.getUserDetailsById = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("-password"); // Exclude the password field

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "User details retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.editUserDetails = async (req, res) => {
  const { userId } = req.params;
  const {
    firstname,
    lastname,
    email,
    phoneNumber,
    country,
    address,
    city,
    state,
    profilePicture,
  } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        firstname,
        lastname,
        email,
        phoneNumber,
        country,
        address,
        city,
        state,
        profilePicture,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "User details updated successfully", user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating user details", error });
  }
};

exports.suspendUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isSuspended: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "User suspended successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Error suspending user", error });
  }
};

exports.disableUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isDisabled: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "User disabled successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Error disabling user", error });
  }
};

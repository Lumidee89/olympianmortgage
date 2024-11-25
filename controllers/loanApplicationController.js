const multer = require("multer");
const path = require("path");
const LoanApplication = require("../models/LoanApplication");
const User = require("../models/User");
require("dotenv").config();
const axios = require("axios");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/documents");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

exports.createLoanApplication = async (req, res) => {
  try {
    const userId = req.userId;
    const newLoanApplication = new LoanApplication({
      userId,
      step1: { mainGoal: req.body.mainGoal },
    });

    await newLoanApplication.save();

    res.status(201).json({
      message: "Loan application created successfully",
      loanApplicationId: newLoanApplication._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating loan application", error });
  }
};

exports.getUserLoanApplications = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(403).json({ message: "Access denied. Users only." });
    }
    const userLoanApplications = await LoanApplication.find({ userId });
    res.status(200).json({ loanApplications: userLoanApplications });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user loan applications", error });
  }
};

exports.editLoanApplication = async (req, res) => {
  try {
    const userId = req.userId;
    const { loanApplicationId, ...updateData } = req.body;

    // Find the loan application by ID and userId
    const loanApplication = await LoanApplication.findOne({
      _id: loanApplicationId,
      userId,
    });

    if (!loanApplication) {
      return res
        .status(404)
        .json({ message: "Loan application not found for the user" });
    }

    // Update fields with data from the request
    for (const step in updateData) {
      loanApplication[step] = updateData[step];
    }

    // Set the updatedAt field to the current date
    loanApplication.updatedAt = new Date();

    // Save the updated loan application
    await loanApplication.save();

    res.status(200).json({ message: "Loan application updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating loan application", error });
  }
};

exports.updateLoanApplication = async (req, res) => {
  try {
    const { loanApplicationId, step, ...updateData } = req.body;
    const userId = req.userId;

    // Ensure loanApplicationId is provided
    if (!loanApplicationId) {
      return res
        .status(400)
        .json({ message: "Loan application ID is required." });
    }

    // Validate the step number
    if (!step || typeof step !== "number" || step < 1 || step > 9) {
      return res
        .status(400)
        .json({ message: "Valid step number (1-9) is required." });
    }

    // Find the loan application for the user
    const loanApplication = await LoanApplication.findOne({
      _id: loanApplicationId,
      userId,
    });

    if (!loanApplication) {
      return res.status(404).json({ message: "Loan application not found." });
    }

    // Dynamically update the specific step
    loanApplication[`step${step}`] = updateData;

    loanApplication.step = step;

    // Update the timestamp
    loanApplication.updatedAt = new Date();

    // Save the changes
    await loanApplication.save();

    res.status(200).json({
      message: `Step ${step} updated successfully.`,
      loanApplication,
    });
  } catch (error) {
    console.error("Error updating loan application:", error);
    res.status(500).json({
      message: "An error occurred while updating the loan application.",
      error: error.message,
    });
  }
};

exports.assignLoanOfficer = async (req, res) => {
  try {
    const { loanApplicationId, loanOfficerId } = req.body;
    const loanApplication = await LoanApplication.findById(loanApplicationId);

    if (!loanApplication) {
      return res.status(404).json({ message: "Loan application not found" });
    }
    loanApplication.assignedLoanOfficer = loanOfficerId;
    loanApplication.status = "approved";

    await loanApplication.save();

    res.status(200).json({
      message:
        "Loan officer assigned successfully and status updated to approved",
    });
  } catch (error) {
    res.status(500).json({ message: "Error assigning loan officer", error });
  }
};

exports.uploadDocuments = [
  upload.fields([
    { name: "bankStatements", maxCount: 1 },
    { name: "profitAndLossStatements", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { loanApplicationId } = req.body;

      // Fetch the loan application document by ID
      const loanApplication = await LoanApplication.findById(loanApplicationId);

      if (!loanApplication) {
        return res.status(404).json({ message: "Loan application not found" });
      }

      // Update the step9 documents with uploaded file paths
      loanApplication.step9 = {
        documents: {
          bankStatements: req.files["bankStatements"]
            ? req.files["bankStatements"][0].path
            : null,
          profitAndLossStatements: req.files["profitAndLossStatements"]
            ? req.files["profitAndLossStatements"][0].path
            : null,
        },
      };

      // Update the current stage to 2
      // - Ibrahim
      loanApplication.currentStage = 2;

      // Save the updated loan application
      await loanApplication.save();

      res
        .status(200)
        .json({ message: "Documents uploaded successfully", loanApplication });
    } catch (error) {
      res.status(500).json({ message: "Error uploading documents", error });
    }
  },
];

const getLoanOffersFromArive = async (loanApplicationData) => {
  try {
    const ariveUrl = "https://api.arive.com/v1/loans/offers";

    const response = await axios.post(ariveUrl, loanApplicationData, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ARIVE_API_KEY,
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching loan offers from ARIVE:",
      error.response.data
    );
    throw error;
  }
};

exports.addLoan = async (req, res) => {
  const {
    userId,
    step1,
    step2,
    step3,
    step4,
    step5,
    step6,
    step7,
    step8,
    step9,
    status,
  } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const newLoan = new LoanApplication({
      userId,
      step1,
      step2,
      step3,
      step4,
      step5,
      step6,
      step7,
      step8,
      step9,
      status: status || "pending",
    });
    await newLoan.save();

    res.status(201).json({
      message: "Loan application created successfully",
      loan: newLoan,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.cloneLoanApplication = async (req, res) => {
  const { loanId } = req.params;

  try {
    const loanToClone = await LoanApplication.findById(loanId);
    if (!loanToClone) {
      return res.status(404).json({ message: "Loan application not found" });
    }
    const clonedLoan = new LoanApplication({
      ...loanToClone.toObject(),
      status: "pending",
      assignedLoanOfficer: null,
    });
    await clonedLoan.save();

    res.status(201).json({
      message: "Loan application cloned successfully",
      loan: clonedLoan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.closeLoanApplication = async (req, res) => {
  const { loanId } = req.params;

  try {
    const loan = await LoanApplication.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Loan application not found" });
    }
    loan.status = "closed";
    await loan.save();
    res.status(200).json({
      message: "Loan application closed successfully",
      loan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.suspendLoanApplication = async (req, res) => {
  const { loanId } = req.params;

  try {
    const loan = await LoanApplication.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Loan application not found" });
    }
    loan.status = "suspended";
    await loan.save();
    res.status(200).json({
      message: "Loan application suspended successfully",
      loan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Clear all Loan Applications based on the User ID
// - Ibrahim

exports.clearLoanApplications = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Delete all loan applications associated with the userId
    const result = await LoanApplication.deleteMany({ userId });

    res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} loan applications for the user.`,
    });
  } catch (error) {
    console.error("Error clearing loan applications:", error);
    res
      .status(500)
      .json({ message: "Error clearing loan applications", error });
  }
};

// Get Loan Application base on Loan ID
// - Ibrahim

exports.getLoanApplicationById = async (req, res) => {
  try {
    const userId = req.userId;
    const { loanApplicationId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!loanApplicationId) {
      return res
        .status(400)
        .json({ message: "Loan application ID is required" });
    }

    // Fetch the loan application matching userId and loanApplicationId
    const loanApplication = await LoanApplication.findOne({
      _id: loanApplicationId,
      userId,
    });

    if (!loanApplication) {
      return res
        .status(404)
        .json({ message: "Loan application not found for the user" });
    }

    res.status(200).json({ loanApplication });
  } catch (error) {
    console.error("Error fetching loan application:", error);
    res.status(500).json({ message: "Error fetching loan application", error });
  }
};

// Ibrahim
exports.getLoansByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find all loans associated with the userId
    const loans = await LoanApplication.find({ userId }).populate(
      "userId",
      "name email"
    );

    if (!loans || loans.length === 0) {
      return res.status(404).json({ message: "No loans found for this user." });
    }

    res.status(200).json({
      message: "Loans retrieved successfully",
      loans,
    });
  } catch (error) {
    console.error("Error fetching loans:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

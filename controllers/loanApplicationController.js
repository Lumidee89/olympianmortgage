const multer = require("multer");
const path = require("path");
const LoanApplication = require("../models/LoanApplication");
const { createNotification } = require('../controllers/notificationController');
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

    //notification LOC
    await createNotification(null, 'Admin', 'A new loan application has been created by a user.');
    await createNotification(userId, 'User', 'Your loan application has been successfully created.');
    //end

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

    //notifications LOC
    await createNotification(null, 'Admin', `A loan application has been updated by user ${userId}.`);
    await createNotification(userId, 'User', 'Your loan application has been updated successfully.' );
    //end

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
    loanApplication.status = "pending";
    loanApplication.currentStage = 3;

    await loanApplication.save();

    //notifications LOC
    await createNotification(null, 'Admin', `A loan officer has been assigned to loan application ${loanApplicationId}.`);
    await createNotification(loanOfficerId, 'User', `You have been assigned to a loan application.`);
    await createNotification(loanApplication.userId, 'User', 'A loan officer has been assigned to your application.');
    //end

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
      const { loanApplicationId, category } = req.body;

      const loanApplication = await LoanApplication.findById(loanApplicationId);

      if (!loanApplication) {
        return res.status(404).json({ message: "Loan application not found" });
      }

      const uploadedFiles = [];

      if (req.files["bankStatements"]) {
        uploadedFiles.push({
          filename: req.files["bankStatements"][0].path,
          uploadedAt: new Date(),
        });
      }

      if (req.files["profitAndLossStatements"]) {
        uploadedFiles.push({
          filename: req.files["profitAndLossStatements"][0].path,
          uploadedAt: new Date(),
        });
      }

      if (category) {

        let categoryObj = loanApplication.step9.categories.find(
          (cat) => cat.name === category
        );

        if (!categoryObj) {

          categoryObj = { name: category, documents: [] };
          loanApplication.step9.categories.push(categoryObj);
        }

        categoryObj.documents.push(...uploadedFiles);
      } else {

        loanApplication.step9.documents = {
          bankStatements: req.files["bankStatements"]
            ? req.files["bankStatements"][0].path
            : null,
          profitAndLossStatements: req.files["profitAndLossStatements"]
            ? req.files["profitAndLossStatements"][0].path
            : null,
        };
      }

      loanApplication.currentStage = 2;

      await loanApplication.save();

      res
        .status(200)
        .json({ message: "Documents uploaded successfully", loanApplication });
    } catch (error) {
      res.status(500).json({ message: "Error uploading documents", error });
    }
  },
];

exports.getUserDocuments = async (req, res) => {
  try {
    const { userId } = req.user;

    const loanApplications = await LoanApplication.find({ userId });

    if (!loanApplications.length) {
      return res.status(404).json({ message: "No documents found" });
    }

    const documents = loanApplications.map((application) => ({
      loanApplicationId: application._id,
      documents: application.step9.documents,
      categories: application.step9.categories,
    }));

    res.status(200).json({ documents });
  } catch (error) {
    res.status(500).json({ message: "Error fetching documents", error });
  }
};

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
    if (req.userRole !== "admin" && req.userRole !== "loan_officer") {
      return res.status(403).json({ message: "Access denied. Role not authorized." });
    }

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

// exports.cloneLoanApplication = async (req, res) => {
//   const { loanId } = req.params;

//   try {
//     const loanToClone = await LoanApplication.findById(loanId);
//     if (!loanToClone) {
//       return res.status(404).json({ message: "Loan application not found" });
//     }
//     const clonedLoan = new LoanApplication({
//       ...loanToClone.toObject(),
//       status: "pending",
//       assignedLoanOfficer: null,
//     });
//     await clonedLoan.save();

//     res.status(201).json({
//       message: "Loan application cloned successfully",
//       loan: clonedLoan,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };

exports.cloneLoanApplication = async (req, res) => {
  const { loanId } = req.params;

  try {
    const loanToClone = await LoanApplication.findById(loanId);
    if (!loanToClone) {
      return res.status(404).json({ message: "Loan application not found" });
    }

    // Allow Admin or Loan Officer to clone
    if (req.userRole !== "admin" && req.userRole !== "loan_officer") {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
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

// exports.closeLoanApplication = async (req, res) => {
//   const { loanId } = req.params;

//   try {
//     const loan = await LoanApplication.findById(loanId);
//     if (!loan) {
//       return res.status(404).json({ message: "Loan application not found" });
//     }
//     loan.status = "closed";
//     await loan.save();

//     //notification LOC
//     await createNotification(null, 'Admin', `Loan application ${loanId} has been closed.`);
//     await createNotification(loan.userId, 'User', 'Your loan application has been closed successfully.');
//     //end

//     res.status(200).json({
//       message: "Loan application closed successfully",
//       loan,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };

exports.closeLoanApplication = async (req, res) => {
  const { loanId } = req.params;

  try {
    const loan = await LoanApplication.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Loan application not found" });
    }

    // Ensure only Admin or Loan Officer can close
    if (req.userRole !== "admin" && req.userRole !== "loan_officer") {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }

    loan.status = "closed";
    await loan.save();

    // Notification Logic
    await createNotification(null, "Admin", `Loan application ${loanId} has been closed.`);
    await createNotification(loan.userId, "User", "Your loan application has been closed successfully.");

    res.status(200).json({
      message: "Loan application closed successfully",
      loan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// exports.suspendLoanApplication = async (req, res) => {
//   const { loanId } = req.params;

//   try {
//     const loan = await LoanApplication.findById(loanId);
//     if (!loan) {
//       return res.status(404).json({ message: "Loan application not found" });
//     }
//     loan.status = "suspended";
//     await loan.save();

//     //notifications LOC
//     await createNotification(null, 'Admin', `Loan application ${loanId} has been suspended.`);
//     await createNotification(loan.userId, 'User', 'Your loan application has been suspended.');
//     //end

//     res.status(200).json({
//       message: "Loan application suspended successfully",
//       loan,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };

exports.suspendLoanApplication = async (req, res) => {
  const { loanId } = req.params;

  try {
    const loan = await LoanApplication.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Loan application not found" });
    }

    // Ensure only Admin or Loan Officer can suspend
    if (req.userRole !== "admin" && req.userRole !== "loan_officer") {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }

    loan.status = "suspended";
    await loan.save();

    // Notifications
    await createNotification(null, "Admin", `Loan application ${loanId} has been suspended.`);
    await createNotification(loan.userId, "User", "Your loan application has been suspended.");

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
    }).populate("userId", "firstname lastname email");

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
      "firstname lastname email"
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

// Ibrahim

exports.getLoansBasedonStatus = async (req, res) => {
  try {
    const { status } = req.query;

    if (!status) {
      return res
        .status(400)
        .json({ error: "Status query parameter is required" });
    }

    // Fetch loans with the specified status
    const loans = await LoanApplication.find({ status });
    res.status(200).json(loans);
  } catch (error) {
    console.error("Error fetching loans:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Ibrahim

exports.updateESignDocuments = async (req, res) => {
  const { applicationId } = req.params;
  const { documentType } = req.body;

  if (!documentType) {
    return res.status(400).json({ error: "Document type is required." });
  }

  try {
    const loanApplication = await LoanApplication.findById(applicationId);

    if (!loanApplication) {
      return res.status(404).json({ error: "Loan application not found." });
    }

    // Update the document  to true
    loanApplication.loanDocuments[documentType] = true;

    // Check if both loanAgreements and deedOfTrust are true
    const { loanAgreements, deedOfTrust } = loanApplication.loanDocuments;
    if (loanAgreements && deedOfTrust) {
      loanApplication.currentStage = 4;
    }

    // Check if both appraisal and PorL are true or pressent
    const { appraisal } = loanApplication.loanDocuments;
    const { profitAndLossStatements } = loanApplication.step9.documents;
    if (appraisal && profitAndLossStatements) {
      loanApplication.currentStage = 5;
    }

    await loanApplication.save();

    res.status(200).json({
      message: "Document signed updated successfully.",
      loanApplication,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Server error. Unable to update document signed." });
  }
};

const multer = require('multer');
const path = require('path');
const LoanApplication = require('../models/LoanApplication');

// Configure multer storage for document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents'); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Create the multer upload middleware
const upload = multer({ storage });

// Create new loan application
exports.createLoanApplication = async (req, res) => {
  try {
    const userId = req.userId;
    const newLoanApplication = new LoanApplication({
      userId,
      step1: { mainGoal: req.body.mainGoal }
    });
    
    // Save the new loan application
    await newLoanApplication.save();
    
    // Return the loanApplicationId along with a success message
    res.status(201).json({
      message: 'Loan application created successfully',
      loanApplicationId: newLoanApplication._id // Return the ID of the new loan application
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating loan application', error });
  }
};

// Update loan application steps
exports.updateLoanApplication = async (req, res) => {
  try {
    const { step, ...updateData } = req.body;
    const userId = req.userId;
    const loanApplication = await LoanApplication.findOne({ userId, status: 'pending' });

    if (!loanApplication) {
      return res.status(404).json({ message: 'Loan application not found' });
    }

    loanApplication[`step${step}`] = updateData;
    await loanApplication.save();

    res.status(200).json({ message: `Step ${step} updated successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating loan application', error });
  }
};

// Assign loan officer (admin)
exports.assignLoanOfficer = async (req, res) => {
  try {
      const { loanApplicationId, loanOfficerId } = req.body;
      const loanApplication = await LoanApplication.findById(loanApplicationId);

      if (!loanApplication) {
          return res.status(404).json({ message: 'Loan application not found' });
      }

      // Assign the loan officer
      loanApplication.assignedLoanOfficer = loanOfficerId;

      // Change status from pending to approved
      loanApplication.status = 'approved';

      await loanApplication.save();

      res.status(200).json({ message: 'Loan officer assigned successfully and status updated to approved' });
  } catch (error) {
      res.status(500).json({ message: 'Error assigning loan officer', error });
  }
};


// Handle document upload for step 10
exports.uploadDocuments = [
  upload.fields([
    { name: 'bankStatements', maxCount: 1 },
    { name: 'profitAndLossStatements', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { loanApplicationId } = req.body;
      const loanApplication = await LoanApplication.findById(loanApplicationId);

      if (!loanApplication) {
        return res.status(404).json({ message: 'Loan application not found' });
      }

      // Update the documents in the loan application
      loanApplication.step10 = {
        documents: {
          bankStatements: req.files['bankStatements'] ? req.files['bankStatements'][0].path : null,
          profitAndLossStatements: req.files['profitAndLossStatements'] ? req.files['profitAndLossStatements'][0].path : null
        }
      };

      await loanApplication.save();

      res.status(200).json({ message: 'Documents uploaded successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading documents', error });
    }
  }
];

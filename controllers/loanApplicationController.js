const multer = require('multer');
const path = require('path');
const LoanApplication = require('../models/LoanApplication');
require('dotenv').config();
const axios = require('axios');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents'); 
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

exports.createLoanApplication = async (req, res) => {
  try {
    const userId = req.userId;
    const newLoanApplication = new LoanApplication({
      userId,
      step1: { mainGoal: req.body.mainGoal }
    });
    
    await newLoanApplication.save();
    
    res.status(201).json({
      message: 'Loan application created successfully',
      loanApplicationId: newLoanApplication._id 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating loan application', error });
  }
};

exports.getUserLoanApplications = async (req, res) => {
  try {
    const userId = req.userId;

    const userLoanApplications = await LoanApplication.find({ userId });

    res.status(200).json({ loanApplications: userLoanApplications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user loan applications', error });
  }
};

exports.editLoanApplication = async (req, res) => {
  try {
    const userId = req.userId;
    const { loanApplicationId, ...updateData } = req.body;

    const loanApplication = await LoanApplication.findOne({ _id: loanApplicationId, userId });

    if (!loanApplication) {
      return res.status(404).json({ message: 'Loan application not found for the user' });
    }

    for (const step in updateData) {
      loanApplication[step] = updateData[step];
    }

    await loanApplication.save();

    res.status(200).json({ message: 'Loan application updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating loan application', error });
  }
};

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

exports.assignLoanOfficer = async (req, res) => {
  try {
      const { loanApplicationId, loanOfficerId } = req.body;
      const loanApplication = await LoanApplication.findById(loanApplicationId);

      if (!loanApplication) {
          return res.status(404).json({ message: 'Loan application not found' });
      }
      loanApplication.assignedLoanOfficer = loanOfficerId;
      loanApplication.status = 'approved';

      await loanApplication.save();

      res.status(200).json({ message: 'Loan officer assigned successfully and status updated to approved' });
  } catch (error) {
      res.status(500).json({ message: 'Error assigning loan officer', error });
  }
};


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

const getLoanOffersFromArive = async (loanApplicationData) => {
  try {
      const ariveUrl = 'https://api.arive.com/v1/loans/offers';

      const response = await axios.post(ariveUrl, loanApplicationData, {
          headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.ARIVE_API_KEY
          }
      });

      return response.data;
  } catch (error) {
      console.error('Error fetching loan offers from ARIVE:', error.response.data);
      throw error;
  }
};
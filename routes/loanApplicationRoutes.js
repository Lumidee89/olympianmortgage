const express = require('express');
const router = express.Router();
const loanApplicationController = require('../controllers/loanApplicationController');
const verifyToken = require('../middlewares/authMiddleware');

// Loan application routes (accessible after login)
router.post('/create', verifyToken, loanApplicationController.createLoanApplication);
router.put('/update', verifyToken, loanApplicationController.updateLoanApplication);
router.post('/assign-loan-officer', verifyToken, loanApplicationController.assignLoanOfficer);

// Document upload route for step 10 (accessible after login)
router.post('/upload-documents', verifyToken, loanApplicationController.uploadDocuments);

module.exports = router;

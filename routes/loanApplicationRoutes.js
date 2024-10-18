const express = require('express');
const router = express.Router();
const loanApplicationController = require('../controllers/loanApplicationController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/create', verifyToken, loanApplicationController.createLoanApplication);
router.put('/update', verifyToken, loanApplicationController.updateLoanApplication);
router.post('/upload-documents', verifyToken, loanApplicationController.uploadDocuments);
router.get('/loan-applications', verifyToken, loanApplicationController.getUserLoanApplications);
router.patch('/loan-applications/:id/edit', verifyToken, loanApplicationController.editLoanApplication);
router.post('/loan-offers', async (req, res) => {
    try {
      const loanApplicationData = req.body; 
      const loanOffers = await getLoanOffersFromArive(loanApplicationData);
      
      res.status(200).json(loanOffers);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching loan offers from ARIVE', error });
    }
  });

module.exports = router;

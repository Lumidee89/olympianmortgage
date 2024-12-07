const express = require("express");
const router = express.Router();
const loanApplicationController = require("../controllers/loanApplicationController");
const { verifyToken, isAdminOrLoanOfficer } = require("../middlewares/authMiddleware");

router.post("/create", verifyToken, loanApplicationController.createLoanApplication);
router.put("/update", verifyToken, loanApplicationController.updateLoanApplication);
router.post("/upload-documents", verifyToken, loanApplicationController.uploadDocuments);
// Ibrahim
router.post("/upload-e-sign-documents/:applicationId", verifyToken, loanApplicationController.updateESignDocuments);
router.get("/loan-applications", verifyToken, loanApplicationController.getUserLoanApplications);
router.patch("/loan-applications/:id/edit", verifyToken, loanApplicationController.editLoanApplication);
router.post("/loan-offers", async (req, res) => {
  try {
    const loanApplicationData = req.body;
    const loanOffers = await getLoanOffersFromArive(loanApplicationData);

    res.status(200).json(loanOffers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching loan offers from ARIVE", error });
  }
});

// Clear all Loan Applications based on the User ID
// - Ibrahim

router.delete("/loan-applications/clear", verifyToken, loanApplicationController.clearLoanApplications);
// Get Loan Application base on Loan ID
// - Ibrahim
router.get("/:loanApplicationId", verifyToken, loanApplicationController.getLoanApplicationById);
// Fetch loans based on status
router.get("/:loan-applications", verifyToken, loanApplicationController.getLoansBasedonStatus);
router.get( "/user-documents", verifyToken, loanApplicationController.getUserDocuments);

module.exports = router;

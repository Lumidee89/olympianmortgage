const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const loanApplicationController = require("../controllers/loanApplicationController");
const leadController = require("../controllers/leadController");
const authController = require("../controllers/authController");
const verifyToken = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/pictureMiddleware");

router.post("/register", adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);
router.post("/add-loan-officer", adminController.addLoanOfficer);
router.post(
  "/assign-loan-officer",

  loanApplicationController.assignLoanOfficer
);
router.get("/loans", verifyToken, adminController.getLoans);

router.post("/add-loan", verifyToken, loanApplicationController.addLoan);

// Ibrahim
router.get(
  "/loans/user/:userId",
  verifyToken,
  loanApplicationController.getLoansByUserId
);

router.get(
  "/loan/:loanApplicationId",
  verifyToken,
  adminController.getLoanApplicationById
);

router.get("/user/:userId", verifyToken, adminController.getUserDetailsById);

router.post("/add-lead", verifyToken, leadController.addLead);
router.get("/leads", verifyToken, leadController.getLeads);

router.post(
  "/clone-loan/:loanId",
  verifyToken,
  loanApplicationController.cloneLoanApplication
);
router.post(
  "/close-loan/:loanId",
  verifyToken,
  loanApplicationController.closeLoanApplication
);
router.post(
  "/suspend-loan/:loanId",
  verifyToken,
  loanApplicationController.suspendLoanApplication
);

router.get("/get-all-users", verifyToken, authController.getAllUsers);

router.put("/users/:userId", verifyToken, adminController.editUserDetails);
router.put("/users/:userId/suspend", verifyToken, adminController.suspendUser);
router.put("/users/:userId/disable", verifyToken, adminController.disableUser);

router.get("/profile", verifyToken, adminController.getAdminProfile);
router.put("/profile", verifyToken, uploadMiddleware, adminController.updateAdminProfile);

module.exports = router;

const express = require("express");
const router = express.Router();
const loanOfficerController = require("../controllers/loanOfficerController");

router.post("/login", loanOfficerController.loginLoanOfficer);
// Ibrahim
router.get("/all", loanOfficerController.getAllLoanOfficers);
router.get("/:id", loanOfficerController.getLoanOfficerById);

module.exports = router;

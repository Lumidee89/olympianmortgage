// routes/loanOfficer.js
const express = require("express");
const router = express.Router();
const loanOfficerController = require("../controllers/loanOfficerController");

router.post("/login", loanOfficerController.loginLoanOfficer);
// Ibrahim
router.get("/all", loanOfficerController.getAllLoanOfficers);

module.exports = router;

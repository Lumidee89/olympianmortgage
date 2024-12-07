const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { verifyToken, isAdminOrLoanOfficer } = require("../middlewares/authMiddleware");

router.post('/add-content', verifyToken, isAdminOrLoanOfficer, contentController.addContent);
router.get('/all', verifyToken, isAdminOrLoanOfficer, contentController.getAllContents);

module.exports = router;

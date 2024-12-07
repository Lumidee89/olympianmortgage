const express = require('express');
const router = express.Router();
const { verifyToken, isAdminOrLoanOfficer } = require("../middlewares/authMiddleware");
const contactController = require('../controllers/contactController');

router.post('/add', verifyToken, isAdminOrLoanOfficer, contactController.createContact);
router.put('/:contactId', verifyToken, isAdminOrLoanOfficer, contactController.updateContact);
router.delete('/:contactId', verifyToken, isAdminOrLoanOfficer, contactController.deleteContact);
router.get('/get', verifyToken, isAdminOrLoanOfficer, contactController.getAllContacts);

module.exports = router;
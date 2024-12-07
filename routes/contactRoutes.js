const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const contactController = require('../controllers/contactController');

router.post('/add', verifyToken, contactController.createContact);
router.put('/:contactId', verifyToken, contactController.updateContact);
router.delete('/:contactId', verifyToken, contactController.deleteContact);
router.get('/get', verifyToken, contactController.getAllContacts);

module.exports = router;
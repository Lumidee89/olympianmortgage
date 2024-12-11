// routes/chat.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken, isAdminOrLoanOfficer } = require("../middlewares/authMiddleware");

router.post('/send', verifyToken, chatController.sendMessage);
router.post('/respond', verifyToken, isAdminOrLoanOfficer, chatController.respondToUser);
router.get('/:loanOfficerId', verifyToken, chatController.getMessages);

router.post('/conversation', verifyToken, chatController.getConversation);
router.post('/send', verifyToken, chatController.sendMessage);

module.exports = router;

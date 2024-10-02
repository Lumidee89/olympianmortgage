// routes/chat.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const verifyToken = require('../middlewares/authMiddleware'); 

router.post('/send', verifyToken, chatController.sendMessage);

router.get('/:loanOfficerId', verifyToken, chatController.getMessages);

module.exports = router;

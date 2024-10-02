// models/ChatMessage.js
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // Reference to the user
    loanOfficerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'LoanOfficer' }, // Reference to the loan officer
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
module.exports = ChatMessage;

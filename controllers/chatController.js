const ChatMessage = require('../models/ChatMessage');
const { createNotification } = require('../controllers/notificationController');
const mongoose = require("mongoose");

exports.sendMessage = async (req, res) => {
    try {
        const { loanOfficerId, message } = req.body;
        const senderId = req.userId; 

        const newMessage = new ChatMessage({
            senderId,
            loanOfficerId,
            message
        });

        await newMessage.save();

        // //notifications
        // const senderRole = req.adminId ? 'Admin' : 'LoanOfficer';
        // const notificationMessage = `${senderRole} sent you a new message: "${message}"`;
        // await createNotification(loanOfficerId, 'LoanOfficer', notificationMessage, { chatMessage: newMessage });
        // if (req.adminId || req.userId) {
        //     await createNotification(senderId, 'User', `You sent a message to Loan Officer`, { chatMessage: newMessage });
        // }
        // //end of notification
        
        res.status(201).json({ message: 'Chat message sent successfully', chatMessage: newMessage });
    } catch (error) {
        res.status(500).json({ message: 'Error sending chat message', error });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { loanOfficerId } = req.params;
        const senderId = req.userId; 

        const messages = await ChatMessage.find({
            $or: [
                { senderId, loanOfficerId },
                { loanOfficerId, senderId }
            ]
        })
        .populate('senderId', 'name email') 
        .populate('loanOfficerId', 'name email'); 

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving chat messages', error });
    }
};

exports.respondToUser = async (req, res) => {
    try {
        const { userId, message } = req.body;
        const loanOfficerId = req.loanOfficerId;

        if (!loanOfficerId) {
            return res.status(403).json({ message: 'Only loan officers can respond to users.' });
        }

        const newMessage = new ChatMessage({
            senderId: loanOfficerId,
            loanOfficerId,
            message,
        });

        await newMessage.save();
        res.status(201).json({ message: 'Response sent successfully', chatMessage: newMessage });
    } catch (error) {
        res.status(500).json({ message: 'Error sending response', error });
    }
};

exports.getConversation = async (req, res) => {
    try {
        const { userId, loanOfficerId } = req.body; // Get parameters from the body

        // Validate presence of required parameters
        if (!userId || !loanOfficerId) {
            return res.status(400).json({ message: "Both userId and loanOfficerId are required." });
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(loanOfficerId)) {
            return res.status(400).json({ message: "Invalid userId or loanOfficerId format." });
        }

        const messages = await ChatMessage.find({
            $or: [
                { senderId: userId, loanOfficerId },
                { senderId: loanOfficerId, loanOfficerId: userId }
            ]
        })
        .sort({ timestamp: 1 })
        .populate("senderId", "name email")
        .populate("loanOfficerId", "name email");

        res.status(200).json({ messages });
    } catch (error) {
        console.error("Error retrieving chat messages:", error);
        res.status(500).json({ message: "Error retrieving conversation", error });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, message } = req.body;
        const senderRole = req.userRole; 
        let senderId, loanOfficerId, userId;

        if (senderRole === "user") {
            senderId = req.userId;
            loanOfficerId = recipientId; // For users, the recipient is the loan officer
        } else if (senderRole === "loan_officer") {
            senderId = req.loanOfficerId; // Sender is the loan officer
            loanOfficerId = req.loanOfficerId; // Include the loan officer's ID
            userId = recipientId; // For loan officers, the recipient is the user
        } else {
            return res.status(403).json({ message: "Unauthorized to send messages." });
        }

        // Log variables for debugging
        console.log({
            senderRole,
            senderId,
            loanOfficerId,
            userId,
            message,
        });

        const newMessage = new ChatMessage({
            senderId,
            loanOfficerId, // Ensure loanOfficerId is always passed
            userId,
            message,
        });

        await newMessage.save();

        res.status(201).json({ message: "Message sent successfully", chatMessage: newMessage });
    } catch (error) {
        console.error("Error in sendMessage:", error); // Log error for debugging
        res.status(500).json({ message: "Error sending message", error });
    }
};
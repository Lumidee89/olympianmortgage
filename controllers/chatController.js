const ChatMessage = require('../models/ChatMessage');
const { createNotification } = require('../controllers/notificationController');

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

        //notifications
        const senderRole = req.adminId ? 'Admin' : 'LoanOfficer';
        const notificationMessage = `${senderRole} sent you a new message: "${message}"`;
        await createNotification(loanOfficerId, 'LoanOfficer', notificationMessage, { chatMessage: newMessage });
        if (req.adminId || req.userId) {
            await createNotification(senderId, 'User', `You sent a message to Loan Officer`, { chatMessage: newMessage });
        }
        //end of notification
        
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

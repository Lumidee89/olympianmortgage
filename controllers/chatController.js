const ChatMessage = require('../models/ChatMessage');

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

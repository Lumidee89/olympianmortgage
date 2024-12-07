const Notification = require('../models/Notification');

exports.createNotification = async (recipientId, recipientType, message, actionDetails = null) => {
    try {
        const notification = new Notification({ recipientId, recipientType, message, actionDetails, });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw new Error('Notification creation failed.');
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.userId || req.adminId;
        const userType = req.adminId ? 'Admin' : 'User';
        const notifications = await Notification.find({ recipientId: userId, recipientType: userType }).sort({ timestamp: -1 });
        res.status(200).json({ message: 'Notifications fetched successfully', notifications });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read', error });
    }
};
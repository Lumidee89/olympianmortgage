const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'recipientType' },
    recipientType: { type: String, enum: ['User', 'Admin'], required: true },
    message: { type: String, required: true },
    actionDetails: { type: Object },
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
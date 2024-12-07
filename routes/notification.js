const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken, isAdminOrLoanOfficer } = require("../middlewares/authMiddleware");

router.get('/', verifyToken, notificationController.getNotifications);
router.put('/:notificationId/read', verifyToken, notificationController.markNotificationAsRead);

module.exports = router;
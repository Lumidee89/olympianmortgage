const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-forgot-password-otp', authController.verifyForgotPasswordOtp);
router.post('/reset-password', authController.resetPassword);

// Protected user routes
// router.post('/some-user-route', verifyToken, (req, res) => {
//     if (req.userId) {
//         // User-specific logic
//         res.send('User route');
//     } else {
//         res.status(403).json({ message: 'Access denied' });
//     }
// });

module.exports = router;

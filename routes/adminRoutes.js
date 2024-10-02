const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const loanApplicationController = require('../controllers/loanApplicationController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/register', adminController.registerAdmin);

router.post('/login', adminController.loginAdmin);

router.post('/add-loan-officer', verifyToken, adminController.addLoanOfficer);

router.post('/assign-loan-officer', verifyToken, loanApplicationController.assignLoanOfficer);

module.exports = router;

// Admin registration route



// const express = require('express');
// const router = express.Router();
// const adminController = require('../controllers/adminController');
// const verifyToken = require('../middlewares/authMiddleware');

// // Register a new admin
// router.post('/register', adminController.registerAdmin);

// // Login as an admin
// router.post('/login', adminController.loginAdmin);

// // router.post('/some-admin-route', verifyToken, (req, res) => {
// //     if (req.adminId) {
// //         // Admin-specific logic
// //         res.send('Admin route');
// //     } else {
// //         res.status(403).json({ message: 'Access denied' });
// //     }
// // });

// // Route for admin to view all loan applications
// router.get('/loans', verifyToken, adminController.getAllLoanApplications);

// // Route for admin to assign loan officer to a loan application
// router.post('/assign-loan-officer/:loanId', verifyToken, adminController.assignLoanOfficer);

// module.exports = router;

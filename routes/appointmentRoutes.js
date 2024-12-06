const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const AppointmentController = require('../controllers/appointmentController');

router.post('/book', verifyToken, AppointmentController.bookAppointment); 
router.get('/user/appointments', verifyToken, AppointmentController.getUserAppointments);
router.post('/loan-officer/respond', verifyToken, AppointmentController.respondToAppointment);
router.get('/loan-officer/appointments', verifyToken, AppointmentController.getLoanOfficerAppointments);

module.exports = router;

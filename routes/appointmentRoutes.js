const express = require('express');
const router = express.Router();
const { verifyToken, isAdminOrLoanOfficer } = require("../middlewares/authMiddleware");
const AppointmentController = require('../controllers/appointmentController');

router.post('/book', verifyToken, AppointmentController.bookAppointment); 
router.get('/user/appointments', verifyToken, AppointmentController.getUserAppointments);
router.post('/loan-officer/respond', verifyToken, AppointmentController.respondToAppointment);
router.get('/loan-officer/appointments', verifyToken, AppointmentController.getLoanOfficerAppointments);
router.delete('/:appointmentId', verifyToken, AppointmentController.deleteAppointment);
router.get('/upcoming', verifyToken, AppointmentController.getUpcomingAppointments);
router.get('/past', verifyToken, AppointmentController.getPastAppointments);

module.exports = router;

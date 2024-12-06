const Appointment = require('../models/Appointment');
const LoanOfficer = require('../models/LoanOfficer');
const User = require('../models/User');

exports.bookAppointment = async (req, res) => {
  try {
    const { appointmentDate, appointmentTime, loanOfficerId } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    const loanOfficer = await LoanOfficer.findById(loanOfficerId);

    if (!user || !loanOfficer) {
      return res.status(404).json({ message: 'User or Loan Officer not found.' });
    }

    const newAppointment = new Appointment({
      userId,
      loanOfficerId,
      appointmentDate,
      appointmentTime,
    });

    await newAppointment.save();

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointmentId: newAppointment._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error booking appointment', error });
  }
};

exports.getUserAppointments = async (req, res) => {
    try {
      const userId = req.userId;
      const appointments = await Appointment.find({ userId }).populate('loanOfficerId');
  
      if (!appointments) {
        return res.status(404).json({ message: 'No appointments found for this user.' });
      }
  
      res.status(200).json({ appointments });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching appointments', error });
    }
};  

exports.getLoanOfficerAppointments = async (req, res) => {
    try {
        const loanOfficerId = req.userId;
        
        const appointments = await Appointment.find({ loanOfficerId }).populate('userId');

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for this loan officer.' });
        }

        res.status(200).json({ appointments });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error });
    }
};

exports.respondToAppointment = async (req, res) => {
    try {
        const { appointmentId, response } = req.body;
        const loanOfficerId = req.loanOfficerId; 
  
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        if (appointment.loanOfficerId.toString() !== loanOfficerId.toString()) {
            return res.status(403).json({ message: 'This appointment does not belong to you.' });
        }

        appointment.status = response;
        appointment.updatedAt = new Date();
        await appointment.save();

        res.status(200).json({ message: `Appointment has been ${response} by the loan officer.` });
    } catch (error) {
        console.error('Error responding to appointment:', error);
        res.status(500).json({ message: 'Error responding to appointment', error: error.message || error });
    }
};

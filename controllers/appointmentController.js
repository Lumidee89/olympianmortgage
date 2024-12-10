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

exports.deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userRole = req.userRole;
    const userId = req.userId;
    const loanOfficerId = req.loanOfficerId;
    const adminId = req.adminId;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    if (userRole === 'user') {
      if (appointment.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'You are not authorized to delete this appointment.' });
      }
    } else if (userRole === 'loan_officer') {
      return res.status(403).json({ message: 'Loan officers are not authorized to delete appointments.' });
    } else if (userRole === 'admin') {
    } else {
      return res.status(403).json({ message: 'Access denied. Invalid role.' });
    }

    await appointment.deleteOne();

    res.status(200).json({ message: 'Appointment deleted successfully.' });

  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Error deleting appointment', error });
  }
};

exports.getUpcomingAppointments = async (req, res) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;
    const loanOfficerId = req.loanOfficerId;

    const currentDate = new Date();

    let appointments;

    if (userRole === 'user') {
      appointments = await Appointment.find({
        userId,
        appointmentDate: { $gte: currentDate },
      }).populate('loanOfficerId');
    } else if (userRole === 'loan_officer') {
      appointments = await Appointment.find({
        loanOfficerId,
        appointmentDate: { $gte: currentDate },
      }).populate('userId');
    } else if (userRole === 'admin') {
      appointments = await Appointment.find({
        appointmentDate: { $gte: currentDate },
      }).populate('userId').populate('loanOfficerId');
    } else {
      return res.status(403).json({ message: 'Access denied. Invalid role.' });
    }

    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ message: 'Error fetching upcoming appointments', error });
  }
};

exports.getPastAppointments = async (req, res) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;
    const loanOfficerId = req.loanOfficerId;

    const currentDate = new Date();

    let appointments;

    if (userRole === 'user') {
      appointments = await Appointment.find({
        userId,
        appointmentDate: { $lt: currentDate },
      }).populate('loanOfficerId');
    } else if (userRole === 'loan_officer') {
      appointments = await Appointment.find({
        loanOfficerId,
        appointmentDate: { $lt: currentDate },
      }).populate('userId');
    } else if (userRole === 'admin') {
      appointments = await Appointment.find({
        appointmentDate: { $lt: currentDate },
      }).populate('userId').populate('loanOfficerId');
    } else {
      return res.status(403).json({ message: 'Access denied. Invalid role.' });
    }

    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Error fetching past appointments:', error);
    res.status(500).json({ message: 'Error fetching past appointments', error });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can view all appointments.' });
    }

    const appointments = await Appointment.find({})
      .populate('userId', 'name email') 
      .populate('loanOfficerId', 'name email'); 

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found.' });
    }

    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    res.status(500).json({ message: 'Error fetching all appointments', error });
  }
};

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loanOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanOfficer', required: true },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true }, 
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Appointment', appointmentSchema);

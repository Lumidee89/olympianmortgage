const mongoose = require('mongoose');
const { Schema } = mongoose;

const LeadSchema = new Schema({
  loanType: { type: String, enum: ['purchase', 'refinance', 'no specification'], required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String }
  },
  leadTeam: { type: Schema.Types.ObjectId, ref: 'LoanOfficer', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', LeadSchema);

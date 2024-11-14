const Lead = require('../models/Lead');
const LoanOfficer = require('../models/LoanOfficer');

exports.addLead = async (req, res) => {
  const { loanType, firstName, lastName, email, phoneNumber, address, leadTeam } = req.body;

  try {
    const loanOfficer = await LoanOfficer.findById(leadTeam);
    if (!loanOfficer) {
      return res.status(404).json({ message: 'Loan officer not found' });
    }
    const newLead = new Lead({
      loanType,
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      leadTeam
    });

    await newLead.save();

    res.status(201).json({
      message: 'Lead added successfully',
      lead: newLead
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().populate('leadTeam', 'name email phone');
    res.status(200).json({ leads });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

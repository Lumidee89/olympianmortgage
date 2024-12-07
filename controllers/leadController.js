const Lead = require('../models/Lead');
const LoanOfficer = require('../models/LoanOfficer');

exports.addLead = async (req, res) => {
  const { loanType, firstName, lastName, email, phoneNumber, address, leadTeam } = req.body;

  try {
    const loanOfficer = await LoanOfficer.findById(leadTeam);
    if (!loanOfficer) {
      return res.status(404).json({ message: 'Loan officer not found' });
    }
    if (req.userRole === 'loan_officer' && req.loanOfficerId !== leadTeam.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only assign leads to yourself.' });
    }

    const newLead = new Lead({
      loanType,
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      leadTeam,
    });

    await newLead.save();

    res.status(201).json({
      message: 'Lead added successfully',
      lead: newLead,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getLeads = async (req, res) => {
  try {
    let leads;
    if (req.userRole === 'loan_officer') {
      leads = await Lead.find({ leadTeam: req.loanOfficerId }).populate('leadTeam', 'name email phone');
    } else {
      leads = await Lead.find().populate('leadTeam', 'name email phone');
    }

    res.status(200).json({ leads });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

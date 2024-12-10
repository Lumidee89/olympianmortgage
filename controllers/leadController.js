const Lead = require("../models/Lead");
const LoanOfficer = require("../models/LoanOfficer");

exports.addLead = async (req, res) => {
  const {
    loanType,
    firstName,
    lastName,
    email,
    phoneNumber,
    address,
    leadTeam,
  } = req.body;

  try {
    const loanOfficer = await LoanOfficer.findById(leadTeam);
    if (!loanOfficer) {
      return res.status(404).json({ message: "Loan officer not found" });
    }
    if (
      req.userRole === "loan_officer" &&
      req.loanOfficerId !== leadTeam.toString()
    ) {
      return res
        .status(403)
        .json({
          message: "Access denied. You can only assign leads to yourself.",
        });
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
      message: "Lead added successfully",
      lead: newLead,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getLeads = async (req, res) => {
  try {
    let leads;
    if (req.userRole === "loan_officer") {
      leads = await Lead.find({ leadTeam: req.loanOfficerId }).populate(
        "leadTeam",
        "name email phone"
      );
    } else {
      leads = await Lead.find().populate("leadTeam", "name email phone");
    }

    leads = await Lead.find().populate("leadTeam", "name email phone");

    res.status(200).json({ leads });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.editLead = async (req, res) => {
  const { leadId } = req.params;
  const {
    loanType,
    firstName,
    lastName,
    email,
    phoneNumber,
    address,
    leadTeam,
  } = req.body;

  try {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (
      req.userRole === "loan_officer" &&
      req.loanOfficerId !== lead.leadTeam.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Access denied. You can only edit your own leads." });
    }

    if (loanType) lead.loanType = loanType;
    if (firstName) lead.firstName = firstName;
    if (lastName) lead.lastName = lastName;
    if (email) lead.email = email;
    if (phoneNumber) lead.phoneNumber = phoneNumber;
    if (address) lead.address = address;
    if (leadTeam) {
      const loanOfficer = await LoanOfficer.findById(leadTeam);
      if (!loanOfficer) {
        return res.status(404).json({ message: "Loan officer not found" });
      }
      lead.leadTeam = leadTeam;
    }

    await lead.save();

    res.status(200).json({
      message: "Lead updated successfully",
      lead,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.deleteLead = async (req, res) => {
  const { leadId } = req.params;

  try {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (
      req.userRole === "loan_officer" &&
      req.loanOfficerId !== lead.leadTeam.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Access denied. You can only delete your own leads." });
    }

    await Lead.findByIdAndDelete(leadId);

    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
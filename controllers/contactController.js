const Contact = require("../models/Contact");

exports.createContact = async (req, res) => {
  try {
    const {
      email,
      contactType,
      firstName,
      lastName,
      suffix,
      license,
      company,
      licenseStatus,
      dob,
      secondaryEmail,
      workPhone,
      streetAddress,
      city,
      zipCode,
      cellPhone,
      homePhone,
      fax,
    } = req.body;

    const loanOfficerId =
      req.userRole === "loan_officer"
        ? req.loanOfficerId
        : req.body.loanOfficerId;

    const newContact = new Contact({
      email,
      contactType,
      firstName,
      lastName,
      suffix,
      license,
      company,
      licenseStatus,
      dob,
      secondaryEmail,
      workPhone,
      streetAddress,
      city,
      zipCode,
      cellPhone,
      homePhone,
      fax,
      loanOfficerId,
    });

    await newContact.save();
    res
      .status(201)
      .json({ message: "Contact created successfully", contact: newContact });
  } catch (error) {
    res.status(500).json({ message: "Error creating contact", error });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const updatedData = req.body;

    const contact = await Contact.findById(contactId);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    if (
      req.userRole === "loan_officer" &&
      contact.loanOfficerId.toString() !== req.loanOfficerId
    ) {
      return res
        .status(403)
        .json({ message: "You can only update your own contacts" });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      updatedData,
      { new: true }
    );

    res
      .status(200)
      .json({
        message: "Contact updated successfully",
        contact: updatedContact,
      });
  } catch (error) {
    res.status(500).json({ message: "Error updating contact", error });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findById(contactId);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    if (
      req.userRole === "loan_officer" &&
      contact.loanOfficerId.toString() !== req.loanOfficerId
    ) {
      return res
        .status(403)
        .json({ message: "You can only delete your own contacts" });
    }

    await Contact.findByIdAndDelete(contactId);

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting contact", error });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    let contacts;

    if (req.userRole === "admin") {
      contacts = await Contact.find().populate("loanOfficerId", "name email");
    } else if (req.userRole === "loan_officer") {
      contacts = await Contact.find({
        loanOfficerId: req.loanOfficerId,
      }).populate("loanOfficerId", "name email");
    }

    res.status(200).json({ contacts });
  } catch (error) {
    res.status(500).json({ message: "Error fetching contacts", error });
  }
};

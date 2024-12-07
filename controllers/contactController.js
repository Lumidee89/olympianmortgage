const Contact = require('../models/Contact');

exports.createContact = async (req, res) => {
    try {
        const { email, contactType, firstName, lastName, suffix, license, company, licenseStatus, dob, secondaryEmail, workPhone, streetAddress, city, zipCode, cellPhone, homePhone, fax, loanOfficerId } = req.body;

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
            loanOfficerId
        });

        await newContact.save();
        res.status(201).json({ message: 'Contact created successfully', contact: newContact });
    } catch (error) {
        res.status(500).json({ message: 'Error creating contact', error });
    }
};

exports.updateContact = async (req, res) => {
    try {
        const { contactId } = req.params;
        const updatedData = req.body;

        const contact = await Contact.findByIdAndUpdate(contactId, updatedData, { new: true });

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.status(200).json({ message: 'Contact updated successfully', contact });
    } catch (error) {
        res.status(500).json({ message: 'Error updating contact', error });
    }
};

exports.deleteContact = async (req, res) => {
    try {
        const { contactId } = req.params;

        const contact = await Contact.findByIdAndDelete(contactId);

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting contact', error });
    }
};

exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().populate('loanOfficerId', 'name email');
        res.status(200).json({ contacts });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contacts', error });
    }
};

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    email: { type: String, required: true },
    contactType: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    suffix: { type: String },
    license: { type: String },
    company: { type: String },
    licenseStatus: { type: String },
    dob: { type: Date },
    secondaryEmail: { type: String },
    workPhone: { type: String },
    streetAddress: { type: String },
    city: { type: String },
    zipCode: { type: String },
    cellPhone: { type: String },
    homePhone: { type: String },
    fax: { type: String },
    loanOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanOfficer' },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
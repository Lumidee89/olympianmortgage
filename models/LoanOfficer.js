// models/LoanOfficer.js
const mongoose = require('mongoose');

const loanOfficerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('LoanOfficer', loanOfficerSchema);

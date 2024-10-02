const mongoose = require('mongoose');
const { Schema } = mongoose;

const LoanApplicationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  step1: {
    mainGoal: { type: String, enum: ['buy a home', 'refinance'], required: true },
  },
  step2: {
    foundHome: { type: String, enum: ['yes', 'no'], required: false },
  },
  step3: {
    refinanceGoal: { 
      goalType: { type: String, enum: ['take cash out of my home', 'lower my monthly payment', 'payoff my mortgage faster'] },
      amount: { type: Number }
    },
  },
  step4: {
    personalInfo: {
      firstName: String,
      middleName: String,
      lastName: String,
      suffix: String,
      married: { type: Boolean },
      email: String,
      phoneNumber: String,
      workPhone: String,
      militaryStatus: { type: String, enum: ['none', 'currently serving on active duty', 'currently retired discharged or separated from service'] },
      coBorrower: {
        firstName: String,
        lastName: String,
        email: String,
        phoneNumber: String,
      },
    },
  },
  step5: {
    propertyInfo: {
      streetAddress: String,
      addressLine2: String,
      city: String,
      state: String,
      zipCode: String,
      homeValue: Number,
      homeUsage: String,
      homeType: String,
      hoaPayment: Number,
    },
  },
  step6: {
    financialInfo: {
      grossIncome: Number,
      bonuses: Number,
      commissions: Number,
      overtime: Number,
      otherIncome: Number,
      employment: {
        employerName: String,
        employerAddress: String,
        position: String,
        contactInfo: String,
        startDate: Date,
        endDate: Date,
        duration: String,
      },
    },
  },
  step7: {
    accountDetails: [{
      accountType: String,
      accountNickname: String,
      amount: Number
    }],
  },
  step8: {
    softCreditCheck: {
      address: {
        street: String,
        apartment: String,
        city: String,
        state: String,
        zipCode: String,
      },
      dateOfBirth: Date,
      ssn: String,
    },
  },
  step9: {
    demographics: {
      race: String,
      sex: String,
      ethnicity: String,
    },
  },
  step10: {
    documents: {
      bankStatements: String,
      profitAndLossStatements: String,
    },
  },
  status: { type: String, default: 'pending' },
  assignedLoanOfficer: { type: Schema.Types.ObjectId, ref: 'Admin' },
});

module.exports = mongoose.model('LoanApplication', LoanApplicationSchema);

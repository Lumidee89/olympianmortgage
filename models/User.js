const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  otp: { type: String }, // OTP for verification
  otpExpiry: { type: Date }, // OTP expiry
  isVerified: { type: Boolean, default: false } // Whether the user has verified their OTP
});

const User = mongoose.model('User', userSchema);

module.exports = User;

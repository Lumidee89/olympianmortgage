const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  country: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  profilePicture: { type: String },
  otp: { type: String },
  otpExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  isDisabled: { type: Boolean, default: false },
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null },
  updatedAt: { type: Date, default: null },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

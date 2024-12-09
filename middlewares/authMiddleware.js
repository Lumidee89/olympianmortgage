const jwt = require("jsonwebtoken");
const config = require("../config/config");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"] || req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  const tokenString = token.split(" ")[1] || token;

  jwt.verify(tokenString, config.jwt.secret || process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Failed to authenticate token." });
    }

    console.log("Decoded Token:", decoded); 

    req.userRole = decoded.role;
    if (decoded.role === "admin") {
      req.adminId = decoded.adminId;
    } else if (decoded.role === "user") {
      req.userId = decoded.userId;
    } else if (decoded.role === "loan_officer") {
      req.loanOfficerId = decoded.loanOfficerId;
    } else {
      return res.status(403).json({ message: "Access denied. Invalid role." });
    }

    next();
  });
};

const isAdminOrLoanOfficer = (req, res, next) => {
  if (req.userRole === "admin" || req.userRole === "loan_officer") {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Role not authorized." });
};

module.exports = { verifyToken, isAdminOrLoanOfficer };
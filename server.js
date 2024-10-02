const express = require('express');
const cors = require("cors");
const connectDB = require("./config/db");
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const loanApplicationRoutes = require('./routes/loanApplicationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

connectDB();

// Middleware
app.use(express.json());

const allowedOrigins = [
    "http://localhost:5173",
    // "https://crawler-integration.netlify.app",
    // "https://crawlertest.netlify.app",
  ];
  
  // CORS Middleware
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/user', userRoutes);
app.use('/api/loan', loanApplicationRoutes);
app.use('/api/admin', adminRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

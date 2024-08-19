const express = require('express');
const connectDB = require("./config/db");
const authRoutes = require('./routes/authRoutes');
const config = require('./config/config');

const app = express();

connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const config = require("./config/config");
const authRoutes = require("./routes/authRoutes");
const loanApplicationRoutes = require("./routes/loanApplicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const loanOfficerRoutes = require("./routes/loanOfficer");
const chatRoutes = require("./routes/chat");

const app = express();

connectDB();

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://olympian-mortgage.vercel.app",
  "http://localhost:5174",
  "http://localhost:5175",
];

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

app.use("/api/auth", authRoutes);
app.use("/api/loan", loanApplicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/loan-officer", loanOfficerRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

3881090226;
// eco

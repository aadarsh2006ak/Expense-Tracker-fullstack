const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { connectDB, getDBStatus } = require("./config/db");
const expenseRoutes = require("./routes/expenseRoutes");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: "*", // allow all in dev / configurable for prod
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for development
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString().split("T")[1].slice(0, 8)}] ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  const db = getDBStatus();
  res.status(200).json({
    status: "online",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: db,
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/expenses", expenseRoutes);

// Welcome root route
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Expense Tracker MERN API is up and running!",
    endpoints: {
      health: "/api/health",
      expenses: "/api/expenses",
      stats: "/api/expenses/stats",
      seed: "POST /api/expenses/seed",
      export: "/api/expenses/export",
    },
  });
});

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error Handler:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Expense Tracker Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check available at: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
});

module.exports = app;

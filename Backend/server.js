require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());

// CORS setup
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Routes
const authRoutes = require("./src/middleware/a.routes.ts"); // match case exactly
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Backend is live Database connected ✅");
});

// Port (Render requires process.env.PORT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
  
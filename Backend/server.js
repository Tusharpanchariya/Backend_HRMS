const express = require("express");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Health check route
app.get("/", async (_req, res) => {
  try {
    await prisma.$connect();
    res.send("Backend is live ✅ Database connected ✅");
    console.log("Backend is live and database connected ✅");
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).send("Database connection failed ❌");
  }
});

// Example: Attach your routes here
// const leaveRoutes = require("./dist/routes/leave.route");
// app.use("/api/leaves", leaveRoutes);

// Automatically run migrations on server start (optional)
async function migrateDatabase() {
  try {
    console.log("Running database migrations...");
    const { exec } = require("child_process");
    exec("npx prisma migrate deploy", (err, stdout, stderr) => {
      if (err) {
        console.error("Migration error:", err);
        return;
      }
      if (stderr) console.error(stderr);
      console.log(stdout);
      console.log("Database migrations complete ✅");
    });
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

// Start server and connect DB
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await migrateDatabase();
});

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "EcoBus Backend is running!",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT VERSION() AS version");

    res.json({
      status: "success",
      message: "Backend connected to MySQL!",
      mysqlVersion: rows[0].version,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Cannot connect to MySQL",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`EcoBus Backend running at http://localhost:${PORT}`);
});

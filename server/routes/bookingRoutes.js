const express = require("express");
const router = express.Router();

const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

const {
  getRecentBookings,
  getAllBookings,
} = require("../controllers/bookingController");

// Lay tat ca don dat ve
router.get("/", verifyToken, requireAdmin, getAllBookings);

// Lay 5 don dat ve gan day
router.get("/recent", verifyToken, requireAdmin, getRecentBookings);

module.exports = router;

const express = require("express");
const router = express.Router();

const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

const { getDashboard } = require("../controllers/dashboardController");

router.get("/", verifyToken, requireAdmin, getDashboard);

module.exports = router;

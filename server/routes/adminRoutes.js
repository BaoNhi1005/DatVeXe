const express = require("express");
const router = express.Router();

const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

const { getUsers, updateUserStatus } = require("../controllers/userController");

const { getTrips, updateTripStatus } = require("../controllers/tripController");

const { getPayments } = require("../controllers/paymentController");

const { getBuses, updateBusStatus } = require("../controllers/busController");

// Tất cả API bên dưới đều yêu cầu đăng nhập Admin
router.use(verifyToken, requireAdmin);

// Kiểm tra quyền Admin
router.get("/check", (req, res) => {
  res.json({
    status: "success",
    message: "Bạn có quyền truy cập Admin!",
    user: req.user,
  });
});

// QUẢN LÝ TÀI KHOẢN
router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);

// QUẢN LÝ CHUYẾN XE
router.get("/trips", getTrips);
router.patch("/trips/:id/status", updateTripStatus);

// QUẢN LÝ THANH TOÁN
router.get("/payments", getPayments);

module.exports = router;

// QUẢN LÝ XE
router.get("/buses", getBuses);
router.patch("/buses/:id/status", updateBusStatus);

const pool = require("../config/db");

// GET /api/admin/payments
// Lấy danh sách giao dịch thanh toán
const getPayments = async (req, res) => {
  try {
    const [payments] = await pool.execute(`
      SELECT
        p.id,
        p.booking_id,
        p.booking_code,
        p.payment_method,
        p.amount,
        p.status,
        p.transaction_id,
        p.paid_at,

        b.customer_name,
        b.customer_phone,
        b.customer_email,

        CONCAT(origin.name, ' → ', destination.name) AS route

      FROM payment_db.payments p

      LEFT JOIN booking_db.bookings b
        ON p.booking_id = b.id

      LEFT JOIN trip_db.trips t
        ON b.trip_id = t.id

      LEFT JOIN trip_db.routes r
        ON t.route_id = r.id

      LEFT JOIN trip_db.stations origin
        ON r.origin_station_id = origin.id

      LEFT JOIN trip_db.stations destination
        ON r.destination_station_id = destination.id

      ORDER BY p.id DESC
    `);

    return res.json({
      status: "success",
      total: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get payments error:", error);

    return res.status(500).json({
      status: "error",
      message: "Không thể tải danh sách thanh toán.",
    });
  }
};

module.exports = {
  getPayments,
};

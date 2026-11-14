const pool = require("../config/db");

// Cau truy van dung chung cho danh sach don dat ve
const bookingQuery = `
  SELECT
    b.id,
    b.booking_code AS bookingCode,
    b.customer_name AS customerName,
    b.customer_phone AS customerPhone,
    b.customer_email AS customerEmail,
    b.total_seats AS totalSeats,
    b.total_amount AS totalAmount,
    b.status,
    b.created_at AS createdAt,
    t.departure_time AS departureTime,
    s1.name AS origin,
    s2.name AS destination,
    CONCAT_WS(' → ', s1.name, s2.name) AS trip,
    (
      SELECT GROUP_CONCAT(
        tk.seat_code
        ORDER BY tk.seat_code
        SEPARATOR ', '
      )
      FROM booking_db.tickets tk
      WHERE tk.booking_id = b.id
    ) AS seats
  FROM booking_db.bookings b
  LEFT JOIN trip_db.trips t
    ON b.trip_id = t.id
  LEFT JOIN trip_db.routes r
    ON t.route_id = r.id
  LEFT JOIN trip_db.stations s1
    ON r.origin_station_id = s1.id
  LEFT JOIN trip_db.stations s2
    ON r.destination_station_id = s2.id
`;

// Lay 5 don dat ve gan day nhat
const getRecentBookings = async (req, res) => {
  try {
    const [bookings] = await pool.query(`
      ${bookingQuery}
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    return res.json({
      status: "success",
      message: "Lay danh sach don dat ve gan day thanh cong",
      bookings,
    });
  } catch (error) {
    console.error("Recent bookings error:", error);

    return res.status(500).json({
      status: "error",
      message: "Khong the lay danh sach don dat ve",
    });
  }
};

// Lay tat ca don dat ve cho trang Quan ly dat ve
const getAllBookings = async (req, res) => {
  try {
    const [bookings] = await pool.query(`
      ${bookingQuery}
      ORDER BY b.created_at DESC
    `);

    return res.json({
      status: "success",
      message: "Lay danh sach don dat ve thanh cong",
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("All bookings error:", error);

    return res.status(500).json({
      status: "error",
      message: "Khong the lay danh sach don dat ve",
    });
  }
};

module.exports = {
  getRecentBookings,
  getAllBookings,
};

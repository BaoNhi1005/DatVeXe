const pool = require("../config/db");

// GET /api/admin/trips
// Lấy danh sách chuyến xe từ trip_db
const getTrips = async (req, res) => {
  try {
    const [trips] = await pool.execute(`
      SELECT
        t.id,
        CONCAT(origin.name, ' → ', destination.name) AS route,
        b.plate_number AS bus,
        COALESCE(u.full_name, 'Chưa phân công') AS driver,
        t.departure_time AS departure,
        t.arrival_time AS arrival,
        t.price,
        t.status
      FROM trip_db.trips t
      INNER JOIN trip_db.routes r
        ON t.route_id = r.id
      INNER JOIN trip_db.stations origin
        ON r.origin_station_id = origin.id
      INNER JOIN trip_db.stations destination
        ON r.destination_station_id = destination.id
      INNER JOIN trip_db.buses b
        ON t.bus_id = b.id
      LEFT JOIN user_db.users u
        ON t.driver_id = u.id
      ORDER BY t.departure_time ASC, t.id DESC
    `);

    return res.json({
      status: "success",
      total: trips.length,
      trips,
    });
  } catch (error) {
    console.error("Get trips error:", error);

    return res.status(500).json({
      status: "error",
      message: "Không thể tải danh sách chuyến xe.",
    });
  }
};

// PATCH /api/admin/trips/:id/status
// Cập nhật trạng thái chuyến xe
const updateTripStatus = async (req, res) => {
  try {
    const tripId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = ["SCHEDULED", "DEPARTED", "COMPLETED", "CANCELLED"];

    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "ID chuyến xe không hợp lệ.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Trạng thái chuyến xe không hợp lệ.",
      });
    }

    const [trips] = await pool.execute(
      `SELECT id FROM trip_db.trips WHERE id = ? LIMIT 1`,
      [tripId],
    );

    if (trips.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy chuyến xe.",
      });
    }

    await pool.execute(`UPDATE trip_db.trips SET status = ? WHERE id = ?`, [
      status,
      tripId,
    ]);

    return res.json({
      status: "success",
      message: "Cập nhật trạng thái chuyến xe thành công.",
      trip: {
        id: tripId,
        status,
      },
    });
  } catch (error) {
    console.error("Update trip status error:", error);

    return res.status(500).json({
      status: "error",
      message: "Không thể cập nhật trạng thái chuyến xe.",
    });
  }
};

module.exports = {
  getTrips,
  updateTripStatus,
};

const pool = require("../config/db");

// GET /api/admin/buses
// Lấy danh sách xe
const getBuses = async (req, res) => {
  try {
    const [buses] = await pool.execute(`
      SELECT
        b.id,
        b.plate_number,
        b.bus_type,
        b.floor_count,
        b.total_seats,
        b.status,
        (
          SELECT COUNT(*)
          FROM trip_db.trips t
          WHERE t.bus_id = b.id
        ) AS total_trips
      FROM trip_db.buses b
      ORDER BY b.id DESC
    `);

    return res.json({
      status: "success",
      total: buses.length,
      buses,
    });
  } catch (error) {
    console.error("Get buses error:", error);

    return res.status(500).json({
      status: "error",
      message: "Không thể tải danh sách xe.",
    });
  }
};

// PATCH /api/admin/buses/:id/status
// Cập nhật trạng thái xe
const updateBusStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["ACTIVE", "MAINTENANCE"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Trạng thái xe không hợp lệ.",
      });
    }

    const [result] = await pool.execute(
      `UPDATE trip_db.buses
       SET status = ?
       WHERE id = ?`,
      [status, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy xe.",
      });
    }

    return res.json({
      status: "success",
      message: "Cập nhật trạng thái xe thành công.",
    });
  } catch (error) {
    console.error("Update bus status error:", error);

    return res.status(500).json({
      status: "error",
      message: "Không thể cập nhật trạng thái xe.",
    });
  }
};

module.exports = {
  getBuses,
  updateBusStatus,
};

const pool = require("../config/db");

// GET /api/admin/users
// Lấy danh sách tài khoản từ user_db
const getUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT
        u.id,
        u.full_name AS name,
        u.email,
        u.phone,
        r.name AS role,
        u.is_active AS active,
        u.created_at AS createdAt
      FROM user_db.users u
      INNER JOIN user_db.roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC, u.id DESC
    `);

    return res.json({
      status: "success",
      total: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      status: "error",
      message: "Không thể tải danh sách tài khoản.",
    });
  }
};

// PATCH /api/admin/users/:id/status
// Khóa hoặc mở khóa tài khoản CUSTOMER / DRIVER
const updateUserStatus = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { active } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "ID tài khoản không hợp lệ.",
      });
    }

    if (typeof active !== "boolean") {
      return res.status(400).json({
        status: "error",
        message: "Trạng thái tài khoản phải là true hoặc false.",
      });
    }

    // Không cho phép thay đổi tài khoản Admin
    const [users] = await pool.execute(
      `SELECT id, role_id FROM user_db.users WHERE id = ? LIMIT 1`,
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy tài khoản.",
      });
    }

    if (users[0].role_id === 1) {
      return res.status(403).json({
        status: "error",
        message: "Không thể khóa hoặc mở khóa tài khoản Admin.",
      });
    }

    await pool.execute(`UPDATE user_db.users SET is_active = ? WHERE id = ?`, [
      active ? 1 : 0,
      userId,
    ]);

    return res.json({
      status: "success",
      message: active
        ? "Đã mở khóa tài khoản thành công."
        : "Đã khóa tài khoản thành công.",
      user: {
        id: userId,
        active,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);

    return res.status(500).json({
      status: "error",
      message: "Không thể cập nhật trạng thái tài khoản.",
    });
  }
};

module.exports = {
  getUsers,
  updateUserStatus,
};

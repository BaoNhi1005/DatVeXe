const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiem tra du lieu dau vao
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Vui long nhap email va mat khau",
      });
    }

    // Tim tai khoan Admin
    const [users] = await pool.execute(
      `SELECT id, role_id, full_name, email, password_hash, is_active
       FROM user_db.users
       WHERE email = ? AND role_id = 1
       LIMIT 1`,
      [email],
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Email hoac mat khau khong chinh xac",
      });
    }

    const user = users[0];

    // Kiem tra trang thai tai khoan
    if (!user.is_active) {
      return res.status(403).json({
        status: "error",
        message: "Tai khoan da bi vo hieu hoa",
      });
    }

    // Kiem tra mat khau
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Email hoac mat khau khong chinh xac",
      });
    }

    // Tao JWT
    const token = jwt.sign(
      {
        userId: user.id,
        roleId: user.role_id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );

    return res.json({
      status: "success",
      message: "Dang nhap Admin thanh cong",
      token,
      admin: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        roleId: user.role_id,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      status: "error",
      message: "Loi may chu",
    });
  }
};

module.exports = { adminLogin };

const jwt = require("jsonwebtoken");

// Kiểm tra JWT Token
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Vui long dang nhap",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Token khong hop le hoac da het han",
    });
  }
};

// Chỉ cho phép Admin truy cập
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.roleId !== 1) {
    return res.status(403).json({
      status: "error",
      message: "Ban khong co quyen truy cap",
    });
  }

  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
};

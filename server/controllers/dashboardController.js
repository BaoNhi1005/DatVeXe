const pool = require("../config/db");

const getDashboard = async (req, res) => {
  try {
    // 1. Thong ke tong quan
    const [[userStats]] = await pool.query(`
      SELECT
        COUNT(*) AS totalUsers,
        SUM(CASE WHEN role_id = 3 THEN 1 ELSE 0 END) AS totalDrivers
      FROM user_db.users
    `);

    const [[driverStats]] = await pool.query(`
      SELECT COUNT(*) AS activeDrivers
      FROM user_db.driver_profiles
      WHERE status = 'ACTIVE'
    `);

    const [[tripStats]] = await pool.query(`
      SELECT
        COUNT(*) AS totalTrips,
        SUM(CASE WHEN status = 'SCHEDULED' THEN 1 ELSE 0 END) AS scheduledTrips
      FROM trip_db.trips
    `);

    const [[bookingStats]] = await pool.query(`
      SELECT
        COUNT(*) AS totalBookings,
        SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) AS confirmedBookings
      FROM booking_db.bookings
    `);

    const [[paymentStats]] = await pool.query(`
      SELECT
        COALESCE(SUM(amount), 0) AS totalRevenue,
        COUNT(*) AS successfulPayments
      FROM payment_db.payments
      WHERE status = 'SUCCESS'
    `);

    // 2. Bieu do doanh thu 6 thang gan nhat
    const [revenueChart] = await pool.query(`
      SELECT
        DATE_FORMAT(paid_at, '%Y-%m') AS month,
        SUM(amount) AS revenue
      FROM payment_db.payments
      WHERE status = 'SUCCESS'
        AND paid_at >= DATE_FORMAT(
          DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01'
        )
      GROUP BY DATE_FORMAT(paid_at, '%Y-%m')
      ORDER BY month
    `);

    // 3. Bieu do so luong dat ve 6 thang gan nhat
    const [bookingChart] = await pool.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS totalBookings
      FROM booking_db.bookings
      WHERE created_at >= DATE_FORMAT(
        DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01'
      )
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `);

    // 4. Bieu do phan bo tai khoan theo vai tro
    const [userChart] = await pool.query(`
      SELECT
        r.name AS role,
        COUNT(u.id) AS total
      FROM user_db.roles r
      LEFT JOIN user_db.users u ON u.role_id = r.id
      GROUP BY r.id, r.name
    `);

    // 5. Top 5 tuyen xe co nhieu luot dat ve
    const [routeChart] = await pool.query(`
      SELECT
        s1.name AS origin,
        s2.name AS destination,
        COUNT(b.id) AS totalBookings
      FROM booking_db.bookings b
      JOIN trip_db.trips t ON b.trip_id = t.id
      JOIN trip_db.routes r ON t.route_id = r.id
      JOIN trip_db.stations s1 ON r.origin_station_id = s1.id
      JOIN trip_db.stations s2 ON r.destination_station_id = s2.id
      GROUP BY r.id, s1.name, s2.name
      ORDER BY totalBookings DESC
      LIMIT 5
    `);

    return res.json({
      status: "success",
      message: "Lay du lieu Dashboard thanh cong",
      overview: {
        totalUsers: userStats.totalUsers,
        totalDrivers: userStats.totalDrivers,
        activeDrivers: driverStats.activeDrivers,
        totalTrips: tripStats.totalTrips,
        scheduledTrips: tripStats.scheduledTrips,
        totalBookings: bookingStats.totalBookings,
        confirmedBookings: bookingStats.confirmedBookings,
        totalRevenue: paymentStats.totalRevenue,
        successfulPayments: paymentStats.successfulPayments,
      },
      charts: {
        revenue: revenueChart,
        bookings: bookingChart,
        users: userChart,
        popularRoutes: routeChart,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      status: "error",
      message: "Khong the lay du lieu Dashboard",
    });
  }
};

module.exports = { getDashboard };

-- =====================================================================
-- ECOBUS - DATABASE UPDATE
-- Các dữ liệu bổ sung so với file database_init.sql ban đầu
-- Cách dùng: Chạy init_all.sql trước, sau đó chạy file này.
-- MySQL 8.x
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. USER_DB: cập nhật mật khẩu Admin và thêm tài khoản
-- ---------------------------------------------------------------------

USE `user_db`;

-- Đồng bộ password_hash của Admin theo database hiện tại
UPDATE `users`
SET `password_hash` = '$2b$10$K9EO53E3WOpRECgaOAu2Re3zFH2E11p87/47OEP7Gkq02ms3c2PXa'
WHERE `id` = 1;

INSERT IGNORE INTO `users`
    (`id`, `role_id`, `full_name`, `email`, `phone`, `password_hash`, `avatar_url`, `is_active`, `created_at`, `updated_at`)
VALUES
    (5, 2, 'Phạm Bảo Nhi', 'baonhi@gmail.com', '0100520054',
     '$2b$10$hiy1a5u4ouF3VXeGNNaD4eE0R3XkJqj6vNEWDdT71MVcHUNAY.jb2', NULL, 1, '2026-11-13 16:45:09', '2026-11-13 18:26:58'),
    (6, 2, 'Nguyễn Minh Anh', 'minhanh@gmail.com', '0903000002',
     '$2b$10$hiy1a5u4ouF3VXeGNNaD4eE0R3XkJqj6vNEWDdT71MVcHUNAY.jb2', NULL, 1, '2026-11-13 18:44:25', '2026-11-13 18:44:25'),
    (7, 2, 'Trần Hoàng Nam', 'hoangnam@gmail.com', '0903000003',
     '$2b$10$hiy1a5u4ouF3VXeGNNaD4eE0R3XkJqj6vNEWDdT71MVcHUNAY.jb2', NULL, 1, '2026-11-13 18:44:25', '2026-11-13 18:44:25'),
    (8, 2, 'Lê Thu Hà', 'thuha@gmail.com', '0903000004',
     '$2b$10$hiy1a5u4ouF3VXeGNNaD4eE0R3XkJqj6vNEWDdT71MVcHUNAY.jb2', NULL, 1, '2026-11-13 18:44:25', '2026-11-13 18:44:25'),
    (9, 3, 'Phạm Quốc Huy', 'driver3@vexere.com', '0902000003',
     '$2b$10$hiy1a5u4ouF3VXeGNNaD4eE0R3XkJqj6vNEWDdT71MVcHUNAY.jb2', NULL, 1, '2026-11-13 18:44:25', '2026-11-13 18:44:25'),
    (10, 3, 'Đỗ Thành Công', 'driver4@vexere.com', '0902000004',
     '$2b$10$hiy1a5u4ouF3VXeGNNaD4eE0R3XkJqj6vNEWDdT71MVcHUNAY.jb2', NULL, 1, '2026-11-13 18:44:25', '2026-11-13 18:44:25'),
    (11, 2, 'Vũ Minh Đức', 'minhduc@gmail.com', '0901234567',
     '$2b$10$hiy1a5u4ouF3VXeGNNaD4eE0R3XkJqj6vNEWDdT71MVcHUNAY.jb2', NULL, 1, '2026-11-13 20:09:51', '2026-11-13 20:09:51'),
    (12, 2, 'Nguyễn Ngọc Mai', 'ngocmai@gmail.com', '0912345678',
     '$2b$10$hiy1a5u4ouF3VXeGNNaD4eE0R3XkJqj6vNEWDdT71MVcHUNAY.jb2', NULL, 1, '2026-11-13 20:09:51', '2026-11-13 20:09:51');

INSERT IGNORE INTO `driver_profiles`
    (`id`, `user_id`, `license_number`, `experience_years`, `status`, `created_at`)
VALUES
    (3, 9, 'GPLX-HN-55331', 4, 'ACTIVE', '2026-11-13 18:44:25'),
    (4, 10, 'GPLX-HN-66442', 6, 'ACTIVE', '2026-11-13 18:44:25');


-- ---------------------------------------------------------------------
-- 2. TRIP_DB: thêm 4 xe và 6 chuyến xe
-- ---------------------------------------------------------------------

USE `trip_db`;

INSERT IGNORE INTO `buses`
    (`id`, `plate_number`, `bus_type`, `floor_count`, `total_seats`, `status`, `created_at`)
VALUES
    (3, '30F-456.78', 'SEAT', 1, 29, 'ACTIVE', '2026-11-13 20:35:43'),
    (4, '51C-789.12', 'SEAT', 1, 45, 'ACTIVE', '2026-11-13 20:35:43'),
    (5, '18B-567.89', 'SLEEPER', 1, 34, 'ACTIVE', '2026-11-13 20:35:43'),
    (6, '43B-222.66', 'LIMOUSINE', 1, 9, 'ACTIVE', '2026-11-13 20:35:43');

INSERT IGNORE INTO `trips`
    (`id`, `route_id`, `bus_id`, `driver_id`, `departure_time`, `arrival_time`, `price`, `status`, `created_at`)
VALUES
    (3, 2, 1, 2, '2026-11-16 18:44:48', '2026-11-17 00:44:48', 320000.00, 'SCHEDULED', '2026-11-13 18:44:48'),
    (4, 1, 2, 9, '2026-11-14 18:44:48', '2026-11-15 00:44:48', 350000.00, 'SCHEDULED', '2026-11-13 18:44:48'),
    (5, 3, 2, 10, '2026-11-15 18:44:48', '2026-11-16 01:44:48', 350000.00, 'SCHEDULED', '2026-11-13 18:44:48'),
    (6, 3, 1, 3, '2026-11-17 18:44:48', '2026-11-18 01:44:48', 320000.00, 'SCHEDULED', '2026-11-13 18:44:48'),
    (7, 2, 2, 9, '2026-11-18 18:44:48', '2026-11-19 00:44:48', 350000.00, 'SCHEDULED', '2026-11-13 18:44:48'),
    (8, 1, 1, 10, '2026-11-19 18:44:48', '2026-11-20 00:44:48', 320000.00, 'SCHEDULED', '2026-11-13 18:44:48');


-- ---------------------------------------------------------------------
-- 3. BOOKING_DB: thêm 6 đơn đặt vé và 2 vé phát hành
-- ---------------------------------------------------------------------

USE `booking_db`;

INSERT IGNORE INTO `bookings`
    (`id`, `booking_code`, `user_id`, `customer_name`, `customer_phone`, `customer_email`,
     `trip_id`, `total_seats`, `total_amount`, `status`, `created_at`, `updated_at`)
VALUES
    (2, 'BK20261113-0002', 5, 'Phạm Bảo Nhi', '0100520054', 'baonhi@gmail.com',
     2, 2, 640000.00, 'CONFIRMED', '2026-11-13 19:38:10', '2026-11-13 19:42:34'),
    (3, 'BK20261113-0003', 6, 'Nguyễn Minh Anh', '0903000002', 'minhanh@gmail.com',
     3, 2, 640000.00, 'CONFIRMED', '2026-11-13 19:38:10', '2026-11-13 19:42:34'),
    (4, 'BK20261113-0004', 7, 'Trần Hoàng Nam', '0903000003', 'hoangnam@gmail.com',
     6, 2, 640000.00, 'CONFIRMED', '2026-11-13 19:38:10', '2026-11-13 19:42:34'),
    (5, 'BK20261113-0005', 8, 'Lê Thu Hà', '0903000004', 'thuha@gmail.com',
     8, 2, 640000.00, 'CONFIRMED', '2026-11-13 19:38:10', '2026-11-13 19:42:34'),
    (9, 'BK20261113-0006', 11, 'Vũ Minh Đức', '0901234567', 'minhduc@gmail.com',
     2, 1, 320000.00, 'CONFIRMED', '2026-11-13 20:09:51', '2026-11-13 20:09:51'),
    (10, 'BK20261113-0007', 12, 'Nguyễn Ngọc Mai', '0912345678', 'ngocmai@gmail.com',
     3, 1, 320000.00, 'CONFIRMED', '2026-11-13 20:09:51', '2026-11-13 20:09:51');

INSERT IGNORE INTO `tickets`
    (`id`, `booking_id`, `trip_id`, `seat_code`, `passenger_name`, `ticket_price`,
     `qr_code`, `check_in_status`, `checked_in_at`, `checked_in_by`)
VALUES
    (3, 9, 2, 'A01', 'Vũ Minh Đức', 320000.00, 'ECO-BK20261113-0006', 'UNCHECKED', NULL, NULL),
    (4, 10, 3, 'A01', 'Nguyễn Ngọc Mai', 320000.00, 'ECO-BK20261113-0007', 'UNCHECKED', NULL, NULL);


-- ---------------------------------------------------------------------
-- 4. PAYMENT_DB: thêm 2 giao dịch thanh toán thành công
-- ---------------------------------------------------------------------

USE `payment_db`;

INSERT IGNORE INTO `payments`
    (`id`, `booking_id`, `booking_code`, `payment_method`, `amount`, `status`,
     `transaction_id`, `paid_at`, `created_at`)
VALUES
    (2, 9, 'BK20261113-0006', 'MOMO', 320000.00, 'SUCCESS',
     'TXN-ECO-0006', '2026-11-13 20:13:59', '2026-11-13 20:13:59'),
    (3, 10, 'BK20261113-0007', 'VNPAY', 320000.00, 'SUCCESS',
     'TXN-ECO-0007', '2026-11-13 20:13:59', '2026-11-13 20:13:59');

-- Không phát sinh payment_logs mới trong dump hiện tại.
-- Các bản ghi payment_logs hiện có trong database gốc được giữ nguyên.

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- KẾT THÚC DATABASE UPDATE
-- ---------------------------------------------------------------------

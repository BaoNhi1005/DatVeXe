-- EcoBus: migration bổ sung đánh giá chuyến xe và hội viên tích điểm
-- Chạy một lần trên các database hiện có. Không chạy lại các file init_all.sql
-- vì các file init có DROP TABLE và sẽ xóa dữ liệu hiện tại.

USE user_db;

ALTER TABLE users
  ADD COLUMN membership_tier ENUM('BRONZE', 'SILVER', 'GOLD') NOT NULL DEFAULT 'BRONZE',
  ADD COLUMN loyalty_points INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS loyalty_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  points_change INT NOT NULL COMMENT 'Dương là tích điểm, âm là tiêu điểm',
  action_type ENUM('WELCOME_BONUS', 'TRIP_REWARD', 'REDEEM_DISCOUNT', 'TIER_UPGRADE') NOT NULL,
  description VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_loyalty_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dữ liệu minh họa cho tài khoản khách hàng mẫu (nếu ID 4 tồn tại).
UPDATE users
SET membership_tier = 'SILVER', loyalty_points = 850
WHERE id = 4 AND role_id = 2;

INSERT INTO loyalty_history (user_id, points_change, action_type, description)
SELECT 4, 500, 'WELCOME_BONUS', 'Thưởng chào mừng kích hoạt tài khoản'
WHERE EXISTS (SELECT 1 FROM users WHERE id = 4)
  AND NOT EXISTS (
    SELECT 1 FROM loyalty_history
    WHERE user_id = 4 AND action_type = 'WELCOME_BONUS'
  );

INSERT INTO loyalty_history (user_id, points_change, action_type, description)
SELECT 4, 350, 'TRIP_REWARD', 'Tích lũy điểm sau khi hoàn thành chuyến đi'
WHERE EXISTS (SELECT 1 FROM users WHERE id = 4)
  AND NOT EXISTS (
    SELECT 1 FROM loyalty_history
    WHERE user_id = 4 AND action_type = 'TRIP_REWARD'
  );

USE trip_db;

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  user_id INT NOT NULL COMMENT 'ID người đánh giá trong user_db',
  customer_name VARCHAR(100) NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_review_rating CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT fk_review_trip
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hai đánh giá mẫu chỉ được thêm nếu chuyến 1 tồn tại và chưa có dữ liệu mẫu.
INSERT INTO reviews (trip_id, user_id, customer_name, rating, comment)
SELECT 1, 4, 'Hoàng Khách Hàng', 5,
       'Xe chạy rất êm, bác tài lái cẩn thận, giường nằm sạch sẽ thơm tho!'
WHERE EXISTS (SELECT 1 FROM trips WHERE id = 1)
  AND NOT EXISTS (
    SELECT 1 FROM reviews WHERE trip_id = 1 AND user_id = 4
      AND customer_name = 'Hoàng Khách Hàng'
  );

INSERT INTO reviews (trip_id, user_id, customer_name, rating, comment)
SELECT 1, 5, 'Lê Thị Mai', 5,
       'Khởi hành đúng giờ, có nước suối và khăn lạnh miễn phí. Rất hài lòng!'
WHERE EXISTS (SELECT 1 FROM trips WHERE id = 1)
  AND NOT EXISTS (
    SELECT 1 FROM reviews WHERE trip_id = 1 AND user_id = 5
      AND customer_name = 'Lê Thị Mai'
  );

-- 1. 建立 projects 資料表
CREATE TABLE `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255),
  `customer` VARCHAR(100),
  `model` VARCHAR(100),
  `sku` VARCHAR(100),
  `owner` VARCHAR(100),
  `status` VARCHAR(50),
  `sfis_version` VARCHAR(100),
  `planned_mp_date` DATE,
  `test_stage` VARCHAR(50),
  `site_count` INT,
  `target_test_time` FLOAT,
  `risk_level` VARCHAR(10),
  `spec_link` VARCHAR(255),
  `issue_link` VARCHAR(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 建立 stations 資料表
CREATE TABLE stations (
  idx INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT,
  station_name VARCHAR(100),
  machine_number VARCHAR(100),
  device_id VARCHAR(100),
  ip_address VARCHAR(100),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 3. 查詢所有專案列表
SELECT * FROM projects ORDER BY id DESC;

-- 4. 根據 project_id 查詢單一專案資料
SELECT * FROM projects WHERE id = ?;

-- 5. 根據 project_id 查詢對應 station 清單
SELECT idx, station_name, machine_number, device_id, ip_address 
FROM stations WHERE project_id = ? ORDER BY idx;

-- 6. 根據 project_id 查詢不重複 station 名稱
SELECT DISTINCT station_name FROM stations WHERE project_id = ? ORDER BY station_name;

-- 7. 新增專案（由 PHP 使用預處理）
INSERT INTO projects (name, customer, model, sku, owner, status)
VALUES (?, ?, ?, ?, ?, ?);

-- 8. 更新專案資料
UPDATE projects SET name = ?, sku = ?, owner = ?, status = ? WHERE id = ?;

-- 9. 新增 station 資料
INSERT INTO stations (project_id, station_name, machine_number, device_id, ip_address, idx)
VALUES (?, ?, ?, ?, ?, ?);

-- 10. 刪除 station
DELETE FROM stations WHERE idx = ?;
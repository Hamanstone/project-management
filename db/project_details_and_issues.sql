-- 建立 project_details 表：用來補充每個專案的測試目標與說明
CREATE TABLE project_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  objective TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 建立 project_issues 表：用來追蹤每個專案的問題、狀態與處理進度
CREATE TABLE project_issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  issue_title VARCHAR(255),
  status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
  owner VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 查詢某專案的所有問題
SELECT * FROM project_issues WHERE project_id = ? ORDER BY status, updated_at DESC;

-- 新增一筆問題記錄
INSERT INTO project_issues (project_id, issue_title, status, owner)
VALUES (?, ?, 'Open', ?);

-- 更新問題狀態
UPDATE project_issues SET status = ?, updated_at = NOW() WHERE id = ?;

-- 查詢專案細節說明
SELECT * FROM project_details WHERE project_id = ?;
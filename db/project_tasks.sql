-- 建立 project_tasks 資料表
CREATE TABLE project_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  task_title VARCHAR(255) NOT NULL,
  status ENUM('Pending', 'Ongoing', 'Done') DEFAULT 'Pending',
  owner VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

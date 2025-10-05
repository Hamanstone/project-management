USE projectdb;

CREATE TABLE IF NOT EXISTS stations (
  idx INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT,
  station_name VARCHAR(100),
  machine_number VARCHAR(100),
  device_id VARCHAR(100),
  ip_address VARCHAR(100),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
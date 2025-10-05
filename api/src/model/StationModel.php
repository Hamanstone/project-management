<?php
// 引入您的資料庫連線配置
// 假設您的 ProjectModel 已經有資料庫連線的邏輯
// 您可以將資料庫連線抽象成一個 Database 類別，或直接複製 ProjectModel 中的連線部分

class StationModel {
    private $conn;

    public function __construct() {
        // 這裡可以使用與 ProjectModel 相同的資料庫連線方式
        $this->conn = new mysqli("localhost", "root", "", "projectdb");
        if ($this->conn->connect_error) {
            die("DB 連線失敗: " . $this->conn->connect_error);
        }
    }

    public function getStationsByProjectId($projectId) {
        $stmt = $this->conn->prepare("SELECT * FROM stations WHERE project_id = ?");
        $stmt->bind_param("i", $projectId);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    // 您可能還需要其他方法，例如 addStation, deleteStation 等
    public function addStation($data) {
        $stmt = $this->conn->prepare("INSERT INTO stations (project_id, station_name, machine_number, device_id, ip_address) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("issss", $data['project_id'], $data['station_name'], $data['machine_number'], $data['device_id'], $data['ip_address']);
        return $stmt->execute();
    }

    public function deleteStation($id) {
        $stmt = $this->conn->prepare("DELETE FROM stations WHERE idx = ?"); // 假設 ID 欄位是 idx
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
?>

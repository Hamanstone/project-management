<?php
class ProjectModel {
  private $conn;

  public function __construct() {
    $this->conn = new mysqli("localhost", "root", "", "projectdb");
    if ($this->conn->connect_error) {
      die("DB 連線失敗: " . $this->conn->connect_error);
    }
  }

  public function fetchAll() {
    $result = $this->conn->query("SELECT * FROM projects");
    return $result->fetch_all(MYSQLI_ASSOC);
  }

  public function save($data) {
    $stmt = $this->conn->prepare("REPLACE INTO projects (id, name, customer, model, owner, status) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssss", $data['id'], $data['name'], $data['customer'], $data['model'], $data['owner'], $data['status']);
    return $stmt->execute();
  }

  public function delete($id) {
    $stmt = $this->conn->prepare("DELETE FROM projects WHERE id = ?");
    $stmt->bind_param("i", $id);
    return $stmt->execute();
  }
}
?>
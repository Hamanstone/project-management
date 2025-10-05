<?php
header('Content-Type: application/json');

// $conn = new mysqli("localhost", "root", "", "projectdb");
require_once("src/config/db.php");

$project_id = isset($_GET['project_id']) ? (int)$_GET['project_id'] : 0;

$data = [];
if ($project_id > 0) {
  $stmt = $conn->prepare("SELECT DISTINCT station_name FROM stations WHERE project_id = ? ORDER BY station_name");
  $stmt->bind_param("i", $project_id);
  $stmt->execute();
  $result = $stmt->get_result();
  while ($row = $result->fetch_assoc()) {
    $data[] = $row['station_name'];
  }
}

echo json_encode($data);
?>

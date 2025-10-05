<?php
header('Content-Type: application/json');
require_once("src/config/db.php");
$id = isset($_GET['project_id']) ? (int)$_GET['project_id'] : 0;

$project = [];
$stations = [];

if ($id > 0) {
  $stmt = $conn->prepare("SELECT * FROM projects WHERE id = ?");
  $stmt->bind_param("i", $id);
  $stmt->execute();
  $project = $stmt->get_result()->fetch_assoc();

  $stmt2 = $conn->prepare("SELECT * FROM stations WHERE project_id = ?");
  $stmt2->bind_param("i", $id);
  $stmt2->execute();
  $stations = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
}

echo json_encode([
  'project' => $project,
  'stations' => $stations
]);
?>

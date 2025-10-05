<?php
require_once("src/config/db.php");
$pid = intval($_GET['project_id'] ?? 0);
$stmt = $conn->prepare("SELECT * FROM project_tasks WHERE project_id = ? ORDER BY created_at DESC");
$stmt->bind_param("i", $pid);
$stmt->execute();
$result = $stmt->get_result();
$tasks = [];
while ($row = $result->fetch_assoc()) {
  $tasks[] = $row;
}
header("Content-Type: application/json");
echo json_encode($tasks);
?>

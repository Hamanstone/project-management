<?php
// $conn = new mysqli("localhost", "root", "", "projectdb");
require_once("src/config/db.php");
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $project_id = (int)$_POST['project_id'];
  $station_name = $_POST['station_name'];
  $machine_number = $_POST['machine_number'];
  $device_id = $_POST['device_id'];
  $ip_address = $_POST['ip_address'];
  $idx = (int)$_POST['idx'];

  $stmt = $conn->prepare("INSERT INTO stations (project_id, station_name, machine_number, device_id, ip_address, idx)
                          VALUES (?, ?, ?, ?, ?, ?)");
  $stmt->bind_param("issssi", $project_id, $station_name, $machine_number, $device_id, $ip_address, $idx);
  $stmt->execute();
}
?>

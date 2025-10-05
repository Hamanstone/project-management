<?php
$conn = new mysqli("localhost", "root", "", "projectdb");
require_once("src/config/db.php");
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $id = (int)$_POST['id'];
  $name = $_POST['name'];
  $sku = $_POST['sku'];
  $owner = $_POST['owner'];
  $stage = $_POST['stage'];
  $status = $_POST['status'];
  $begin = $_POST['begin_date'] ?? null;
  $end = $_POST['end_date'] ?? null;

  $stmt = $conn->prepare("UPDATE projects SET name=?, sku=?, owner=?, stage=?, status=?, begin_date=?, end_date=? WHERE id=?");
  $stmt->bind_param("sssssssi", $name, $sku, $owner, $stage, $status, $begin, $end, $id);
  $stmt->execute();
}
?>

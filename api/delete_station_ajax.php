<?php
// $conn = new mysqli("localhost", "root", "", "projectdb");
require_once("src/config/db.php");
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'])) {
  $id = (int)$_POST['id'];
  $stmt = $conn->prepare("DELETE FROM stations WHERE idx = ?");
  $stmt->bind_param("i", $id);
  $stmt->execute();
}
?>

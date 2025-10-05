<?php
header('Content-Type: application/json');

// 引入資料庫連線或 Model
require_once('src/model/StationModel.php'); // 假設您有一個 StationModel

$projectId = $_GET['project_id'] ?? null;

if (!$projectId) {
    echo json_encode(['error' => 'Project ID is required.']);
    exit;
}

try {
    $stationModel = new StationModel(); // 假設您的 StationModel 類別
    $stations = $stationModel->getStationsByProjectId($projectId); // 假設有這個方法
    echo json_encode($stations);
} catch (Exception $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

?>

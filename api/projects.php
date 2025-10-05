<?php
require_once("src/controller/ProjectController.php");

header('Content-Type: application/json'); // 設置響應頭為 JSON

$controller = new ProjectController();
$projects = $controller->getAllProjects(); // 或者根據 GET/POST 參數實現分頁、篩選

echo json_encode($projects); // 將資料轉換為 JSON 格式輸出
?>

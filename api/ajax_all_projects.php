<?php
// api/ajax_all_projects.php
require_once("src/config/db.php"); // 確保 $conn 連線可用

header('Content-Type: application/json');

$projects = [];

// 更新 SQL 查詢以包含所有需要的欄位，並確保 updated_at 供前端顯示最後更新時間
$sql = "SELECT id, name, model, sku, customer, owner, status, stage, summary_link, begin_date, end_date, updated_at FROM projects ORDER BY name ASC";

$result = $conn->query($sql);

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $projects[] = $row;
    }
    $result->free();
} else {
    // 錯誤處理
    http_response_code(500);
    echo json_encode(['error' => '無法獲取專案數據: ' . $conn->error]);
    exit;
}

echo json_encode($projects);

$conn->close();
?>

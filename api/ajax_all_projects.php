<?php
// api/ajax_all_projects.php
require_once("src/config/db.php"); // 確保 $conn 連線可用

header('Content-Type: application/json');

$projects = [];

// 更新 SQL 查詢以包含所有需要的欄位，並移除不再需要的欄位
// 確保 model 和 sku 在查詢列表中
// 移除 description, tags, team, updated_at 等不存在的欄位來修復 SQL 錯誤
// 將 updated_at 加入查詢，確保前端能獲取到真實的最後更新時間
$sql = "SELECT id, name, model, sku, customer, owner, status, stage, summary_link, begin_date, end_date FROM projects ORDER BY name ASC";

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

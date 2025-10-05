<?php
// api/get_projects.php
require_once("src/config/db.php"); // 確保 $conn 連線可用

header('Content-Type: application/json');

$projects = [];

// 定義顏色循環列表
$color_cycle = [
    'green', 'orange', 'red', 'yellow', 'purple',
    'blue', 'indigo', 'pink', 'teal', 'cyan'
];
$color_index = 0; // 初始化顏色索引，用於循環

// 假設你的 projects 表格有 id, name, begin_date, end_date 欄位
$sql = "SELECT id, name, begin_date, end_date FROM projects ORDER BY name ASC";
$result = $conn->query($sql);

if ($result) {
    while ($row = $result->fetch_assoc()) {
        // 從顏色循環列表中獲取當前專案要使用的顏色
        $current_color = $color_cycle[$color_index];
        // 更新顏色索引，當達到列表末尾時循環回第一個顏色
        $color_index = ($color_index + 1) % count($color_cycle);

        $project = [
            'id' => (int)$row['id'], // 確保 id 為數字
            'name' => $row['name'],
            'schedule' => [] // 初始化 schedule 物件
        ];

        // 處理 begin_date 和 end_date 以創建 schedule
        try {
            $beginDate = new DateTime($row['begin_date']);
            $endDate = new DateTime($row['end_date']);

            // 迭代從 begin_date 到 end_date (包含) 的每一天
            $currentDate = clone $beginDate;
            while ($currentDate <= $endDate) {
                $dateString = $currentDate->format('Y-m-d');
                // 為每個日期分配專案的循環顏色
                $project['schedule'][$dateString] = $current_color;
                $currentDate->modify('+1 day');
            }
        } catch (Exception $e) {
            // 日期解析錯誤處理，可以選擇跳過或記錄錯誤
            error_log("日期解析錯誤： " . $e->getMessage() . " for project ID: " . $row['id']);
        }

        $projects[] = $project;
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

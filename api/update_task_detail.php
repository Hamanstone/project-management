<?php
// api/update_task_detail.php 範例
require_once('src/config/db.php');
$pid = intval($_POST['project_id'] ?? 0);
$id = $_POST['id'];
$title = $_POST['title'];
$owner = $_POST['owner'];
$status = $_POST['status'];
$description = $_POST['description'];

$stmt = $conn->prepare("UPDATE project_tasks SET task_title=?, owner=?, status=?, description=? WHERE id=?");
$stmt->bind_param("ssssi", $title, $owner, $status, $description, $id);
if ($stmt->execute()) {
    $count_stmt = $conn->prepare("SELECT COUNT(*) AS ongoing_tasks_count FROM project_tasks WHERE project_id = ? AND status = 'Ongoing'");
    $count_stmt->bind_param("i", $pid);
    $count_stmt->execute();
    $result = $count_stmt->get_result();
    $row = $result->fetch_assoc();
    $ongoing_tasks_count = $row['ongoing_tasks_count'];

    // 3. 更新對應 project_id 的 projects 表格中的 tasks_count 欄位
    // 假設 tasks_count 欄位在 projects 表中
    $update_stmt = $conn->prepare("UPDATE projects SET tasks_count = ? WHERE id = ?");
    $update_stmt->bind_param("ii", $ongoing_tasks_count, $pid);
    
    if ($update_stmt->execute()) {
        echo $ongoing_tasks_count; // 新增問題並更新計數成功
    } else {
        http_response_code(500);
        echo "Failed to update ongoing task count: " . $update_stmt->error;
    }
    
    $count_stmt->close();
    $update_stmt->close();

} else {
    http_response_code(500);
    echo "Failed to update task: " . $stmt->error;
}

$stmt->close();
$conn->close(); // 確保連線在腳本結束前關閉
?>

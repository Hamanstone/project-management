<?php
declare(strict_types=1);
require_once("src/config/pdo_db.php");

$pid = isset($_GET['project_id']) ? require_int($_GET['project_id'], 'project_id') : null;
if ($pid === null) {
	http_response_code(422);
	$error_response = [
		'status' => 'INVALID_PARAM',
		'message' => 'project_id is required.',
	];
	// 將陣列轉換為 JSON 格式並輸出
	echo json_encode($error_response);
}

try {
	$sql = "SELECT id, project_id, title, event_date, time_start, time_end, linked_task, status, note, created_at, updated_at
			FROM project_events
			WHERE project_id = :pid
			ORDER BY event_date ASC, COALESCE(time_start, '23:59') ASC, id ASC";
	$stmt = pdo()->prepare($sql);
	$stmt->execute([':pid' => $pid]);
	$rows = $stmt->fetchAll();

	$items = [];
	foreach ($rows as $r) {
		$date_display = date('Y/m/d', strtotime($r['event_date']));
		$datetime = $date_display . (empty($r['time_start']) ? '' : (', ' . substr($r['time_start'], 0, 5)));
		$items[] = [
			'id'          => (int)$r['id'],
			'title'       => $r['title'],
			'datetime'    => $datetime,                 // 用於 Timeline 顯示
			// 下面欄位提供給未來（若要點擊事件進行編輯可以直接帶回）
			'date'        => $date_display,             // YYYY/MM/DD
			'time_start'  => $r['time_start'] ? substr($r['time_start'], 0, 5) : null,
			'time_end'    => $r['time_end'] ? substr($r['time_end'], 0, 5) : null,
			'linked_task' => $r['linked_task'],
			'status'      => $r['status'],
			'note'        => $r['note'],
		];
	}

	echo json_encode(['items' => $items], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
	// 設置 HTTP 狀態碼為 500 Internal Server Error
	http_response_code(500);
	// 建立一個包含錯誤資訊的陣列
	$error_response = [
		'status' => 'DB_QUERY_FAIL',
		'message' => 'Failed to load events.',
		'detail' => $e->getMessage() // $e 應為捕獲到的例外物件
	];
	// 將陣列轉換為 JSON 格式並輸出
	echo json_encode($error_response);
}

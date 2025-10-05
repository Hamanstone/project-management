<?php
// api/update_project.php (mysqli 版，含 debug 完整 SQL 輸出)
header('Content-Type: application/json; charset=utf-8');

// 只接受 POST
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
  exit;
}

require_once("src/config/db.php");
$conn->set_charset('utf8mb4');

// ========= 工具：日期正規化 =========
function normalize_date(?string $s): ?string {
  if (!$s) return null;
  $s = trim($s);
  if ($s === '') return null;
  $s = str_replace('/', '-', $s);
  $dt = DateTime::createFromFormat('Y-m-d', $s);
  return $dt ? $dt->format('Y-m-d') : null;
}

// ========= 輸入 =========
$id = $_POST['id'] ?? null;
if (!ctype_digit((string)$id)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Invalid project id']);
  exit;
}

// 對應：前端 key -> 資料表欄位
$mapping = [
  'name'         => 'name',
  'customer'     => 'customer',
  'model'        => 'model',
  'sku'          => 'sku',
  'category'     => 'category',
  'location'     => 'location',
  'owner'        => 'owner',
  'stage'        => 'stage',
  'status'       => 'status',
  'sfis_version' => 'sfis_version',
  'tasks_count'  => 'tasks_count',
  'issues_count' => 'issues_count',
  'site_count'   => 'site_count',
  'target_test_time' => 'target_test_time',
  'risk_level'   => 'risk_level',
  'spec_link'    => 'spec_link',
  'issue_link'   => 'issue_link',
];

// 準備 SET 子句
$setParts = [];
$values   = [];
$types    = ''; // bind_param 型別字串（s=string, i=int, d=double, b=blob）

// 文字欄位（統一當 string）
$stringCols = [
  'name','customer','model','sku','category','location','owner','stage','status',
  'sfis_version','risk_level','spec_link','issue_link'
];

// 整數欄位
$intCols = ['tasks_count','issues_count','site_count'];

// 浮點欄位
$floatCols = ['target_test_time'];

// 依白名單收集要更新的欄位
foreach ($mapping as $postKey => $col) {
  if (array_key_exists($postKey, $_POST)) {
    $raw = $_POST[$postKey];

    // 空字串視為 NULL（如果你不想變 NULL，可自行改成保留空字串）
    $val = (trim((string)$raw) === '') ? null : $raw;

    if (in_array($postKey, $stringCols, true)) {
      $setParts[] = "`$col` = ?";
      $types     .= 's';
      $values[]   = $val; // null 也可
    } elseif (in_array($postKey, $intCols, true)) {
      $setParts[] = "`$col` = ?";
      $types     .= 'i';
      $values[]   = ($val === null) ? null : (int)$val;
    } elseif (in_array($postKey, $floatCols, true)) {
      $setParts[] = "`$col` = ?";
      $types     .= 'd';
      $values[]   = ($val === null) ? null : (float)$val;
    }
  }
}

// 日期另外處理（接受 start / end 兩個 POST keys）
if (array_key_exists('start', $_POST)) {
  $nd = normalize_date($_POST['start']);
  if ($_POST['start'] !== '' && $nd === null) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid start date format']);
    exit;
  }
  $setParts[] = "`begin_date` = ?";
  $types     .= 's';
  $values[]   = $nd; // 允許為 null
}

if (array_key_exists('end', $_POST)) {
  $nd = normalize_date($_POST['end']);
  if ($_POST['end'] !== '' && $nd === null) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid end date format']);
    exit;
  }
  $setParts[] = "`end_date` = ?";
  $types     .= 's';
  $values[]   = $nd; // 允許為 null
}

if (empty($setParts)) {
  echo json_encode(['success' => false, 'message' => 'No updatable fields provided']);
  exit;
}

$sql = "UPDATE `projects` SET ".implode(', ', $setParts)." WHERE `id` = ? LIMIT 1";
$types .= 'i';
$values[] = (int)$id;

// ====== 產生完整已帶值 SQL（debug 用，不會送去 DB）======
function sql_debug_filled($conn, string $sql, string $types, array $vals): string {
  $out = $sql;
  $pos = 0;
  for ($i = 0; $i < strlen($types); $i++) {
    $type = $types[$i];
    $val  = $vals[$i];

    // 找下一個 ? 位置
    $qPos = strpos($out, '?', $pos);
    if ($qPos === false) break;

    // 轉成顯示文字
    if ($val === null) {
      $rep = 'NULL';
    } else {
      if ($type === 'i' || $type === 'd') {
        $rep = (string)$val;
      } else {
        // string：用 real_escape_string + quote
        $rep = "'".$conn->real_escape_string((string)$val)."'";
      }
    }

    // 用前半 + 替換 + 後半 組回字串
    $out = substr($out, 0, $qPos) . $rep . substr($out, $qPos + 1);
    $pos = $qPos + strlen($rep);
  }
  return $out;
}

$debugSql = sql_debug_filled($conn, $sql, $types, $values);

// ====== 正式執行 ======
$stmt = $conn->prepare($sql);
if (!$stmt) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Prepare failed', 'error' => $conn->error, 'debug_sql' => $debugSql]);
  exit;
}

// 注意：可變參考需要用 unpack 技巧
$stmt->bind_param($types, ...$values);

$ok = $stmt->execute();
if (!$ok) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Execute failed', 'error' => $stmt->error, 'debug_sql' => $debugSql]);
  $stmt->close();
  $conn->close();
  exit;
}

$affected = $stmt->affected_rows;
$stmt->close();
$conn->close();

echo json_encode([
  'success'   => true,
  'updated'   => $affected,   // 0 也可能表示資料未變更
  // 'debug_sql' => $debugSql,   // ✅ 完整已帶值的 SQL（拿去 phpMyAdmin 測）
], JSON_UNESCAPED_UNICODE);
?>

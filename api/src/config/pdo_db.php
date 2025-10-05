<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

/**
 * Minimal PDO bootstrap.
 * Configure via env: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS
 * or edit the fallbacks below.
 */
function pdo(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $host = getenv('DB_HOST') ?: 'localhost';
    $db   = getenv('DB_NAME') ?: 'projectdb';
    $user = getenv('DB_USER') ?: 'root';
    $pass = getenv('DB_PASS') ?: '';
    $port = getenv('DB_PORT') ?: '3306';
    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    try {
        $pdo = new PDO($dsn, $user, $pass, $options);
        return $pdo;
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['success'=>false, 'error'=>'DB_CONNECT_FAIL', 'message'=>$e->getMessage()]);
        exit;
    }
}

function json_success(array $data = [], int $status=200): void {
    http_response_code($status);
    echo json_encode(array_merge(['success'=>true], $data), JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error(string $code, string $message, int $status=400, array $extra=[]): void {
    http_response_code($status);
    echo json_encode(array_merge(['success'=>false, 'error'=>$code, 'message'=>$message], $extra), JSON_UNESCAPED_UNICODE);
    exit;
}

/** Accept YYYY/MM/DD or YYYY-MM-DD → return YYYY-MM-DD (or null if invalid) */
function normalize_date(?string $s): ?string {
    if ($s===null) return null;
    $t = trim(str_replace('/', '-', $s));
    if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $t, $m)) return null;
    if (!checkdate((int)$m[2], (int)$m[3], (int)$m[1])) return null;
    return sprintf('%04d-%02d-%02d', $m[1], $m[2], $m[3]);
}

/** Accept HH:mm (24h) → return HH:mm (or null if invalid) */
function normalize_time(?string $s): ?string {
    if ($s===null || $s==='') return null;
    $s = trim($s);
    if (!preg_match('/^([01]\d|2[0-3]):([0-5]\d)$/', $s)) return null;
    return $s;
}

function require_int($value, string $name): int {
    if ($value===null || $value==='') json_error('INVALID_PARAM', "$name is required.", 422);
    if (!ctype_digit((string)$value)) json_error('INVALID_PARAM', "$name must be a positive integer.", 422);
    return (int)$value;
}

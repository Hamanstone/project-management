<?php

header('Content-Type: application/json');

$summaryDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'summary';
if (!is_dir($summaryDir) && !mkdir($summaryDir, 0777, true) && !is_dir($summaryDir)) {
    http_response_code(500);
    echo json_encode(['error' => 'Unable to initialize summary storage.']);
    exit;
}

require_once __DIR__ . '/src/config/db.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

function sanitize_text(?string $value): string
{
    return trim($value ?? '');
}

function normalize_date(?string $value): ?string
{
    if (!$value) {
        return null;
    }

    $value = trim($value);
    if ($value === '') {
        return null;
    }

    $date = DateTime::createFromFormat('Y-m-d', $value);
    return ($date && $date->format('Y-m-d') === $value) ? $value : null;
}

function write_summary_file(string $baseDir, int $id, string $name, string $contents): string
{
    $slug = preg_replace('/[^A-Za-z0-9]+/', '-', strtolower($name));
    $slug = trim($slug, '-');
    if ($slug === '') {
        $slug = 'project';
    }

    $timestamp = date('Ymd_His');
    $filename = sprintf('%d_%s_%s.md', $id, $slug, $timestamp);
    $filepath = $baseDir . DIRECTORY_SEPARATOR . $filename;

    if (file_put_contents($filepath, $contents, LOCK_EX) === false) {
        throw new RuntimeException('Unable to write summary file.');
    }

    return 'summary/' . $filename;
}

$name = sanitize_text($_POST['name'] ?? '');
$customer = sanitize_text($_POST['customer'] ?? '');
$owner = sanitize_text($_POST['owner'] ?? '');
$status = sanitize_text($_POST['status'] ?? '');
$stage = sanitize_text($_POST['stage'] ?? '');
$model = sanitize_text($_POST['model'] ?? '');
$sku = sanitize_text($_POST['sku'] ?? '');
$summary = isset($_POST['summary']) ? trim((string)$_POST['summary']) : '';

$id = isset($_POST['id']) && $_POST['id'] !== '' ? (int)$_POST['id'] : null;
$beginDate = normalize_date($_POST['startDate'] ?? null);
$endDate = normalize_date($_POST['endDate'] ?? null);

if ($name === '') {
    http_response_code(422);
    echo json_encode(['error' => 'Project name is required.']);
    exit;
}

if ($owner === '') {
    http_response_code(422);
    echo json_encode(['error' => 'Project owner is required.']);
    exit;
}

$status = $status !== '' ? $status : 'Active';
$stage = $stage !== '' ? $stage : 'Unknown';

try {
    if ($id) {
        $summaryLink = null;
        if ($summary !== '') {
            $summaryLink = write_summary_file($summaryDir, $id, $name, $summary);
        }

        if ($summaryLink !== null) {
            $sql = 'UPDATE projects SET name = ?, customer = ?, owner = ?, status = ?, stage = ?, model = ?, sku = ?, begin_date = ?, end_date = ?, summary_link = ? WHERE id = ?';
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                throw new RuntimeException('Failed to prepare update statement: ' . $conn->error);
            }
            $stmt->bind_param(
                'ssssssssssi',
                $name,
                $customer,
                $owner,
                $status,
                $stage,
                $model,
                $sku,
                $beginDate,
                $endDate,
                $summaryLink,
                $id
            );
        } else {
            $sql = 'UPDATE projects SET name = ?, customer = ?, owner = ?, status = ?, stage = ?, model = ?, sku = ?, begin_date = ?, end_date = ? WHERE id = ?';
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                throw new RuntimeException('Failed to prepare update statement: ' . $conn->error);
            }
            $stmt->bind_param(
                'sssssssssi',
                $name,
                $customer,
                $owner,
                $status,
                $stage,
                $model,
                $sku,
                $beginDate,
                $endDate,
                $id
            );
        }

        if (!$stmt->execute()) {
            throw new RuntimeException('Failed to update project: ' . $stmt->error);
        }
        $stmt->close();
    } else {
        $sql = 'INSERT INTO projects (name, customer, owner, status, stage, model, sku, begin_date, end_date, summary_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new RuntimeException('Failed to prepare insert statement: ' . $conn->error);
        }
        $initialSummaryLink = null;
        $stmt->bind_param(
            'ssssssssss',
            $name,
            $customer,
            $owner,
            $status,
            $stage,
            $model,
            $sku,
            $beginDate,
            $endDate,
            $initialSummaryLink
        );
        if (!$stmt->execute()) {
            throw new RuntimeException('Failed to create project: ' . $stmt->error);
        }
        $id = (int)$stmt->insert_id;
        $stmt->close();

        if ($summary !== '') {
            $summaryLink = write_summary_file($summaryDir, $id, $name, $summary);
            $stmt = $conn->prepare('UPDATE projects SET summary_link = ? WHERE id = ?');
            if ($stmt) {
                $stmt->bind_param('si', $summaryLink, $id);
                $stmt->execute();
                $stmt->close();
            }
        }
    }

    $stmt = $conn->prepare('SELECT id, name, customer, owner, status, stage, model, sku, begin_date, end_date, summary_link FROM projects WHERE id = ?');
    if (!$stmt) {
        throw new RuntimeException('Failed to prepare fetch statement: ' . $conn->error);
    }
    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) {
        throw new RuntimeException('Failed to fetch project: ' . $stmt->error);
    }

    $result = $stmt->get_result();
    $project = $result ? $result->fetch_assoc() : null;
    $stmt->close();

    if (!$project) {
        throw new RuntimeException('Unable to load project after save.');
    }

    echo json_encode(['success' => true, 'project' => $project]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    $conn->close();
}

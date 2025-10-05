<?php

header('Content-Type: application/json');

$summaryDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'summary';
if (!is_dir($summaryDir)) {
    if (!mkdir($summaryDir, 0755, true) && !is_dir($summaryDir)) {
        http_response_code(500);
        echo json_encode(['error' => 'Unable to initialize summary storage.']);
        exit;
    }
}
@chmod($summaryDir, 0755);

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

function build_summary_filename(int $id, string $name): string
{
    $slug = preg_replace('/[^A-Za-z0-9]+/', '-', strtolower($name));
    $slug = trim($slug, '-');
    if ($slug === '') {
        $slug = 'project';
    }

    return sprintf('%d_%s.md', $id, $slug);
}

function resolve_summary_path(string $baseDir, ?string $link): ?string
{
    if ($link === null || $link === '') {
        return null;
    }

    $relative = ltrim($link, '/');
    if (strpos($relative, 'summary/') === 0) {
        $relative = substr($relative, strlen('summary/'));
    }

    if ($relative === '') {
        return null;
    }

    return $baseDir . DIRECTORY_SEPARATOR . $relative;
}

function write_summary_file(string $baseDir, int $id, string $name, string $contents, ?string $existingLink = null): string
{
    $preferredFilename = build_summary_filename($id, $name);
    $preferredPath = $baseDir . DIRECTORY_SEPARATOR . $preferredFilename;
    $targetPath = $preferredPath;

    $existingPath = resolve_summary_path($baseDir, $existingLink);
    if ($existingPath && file_exists($existingPath)) {
        $existingFilename = basename($existingPath);

        if ($existingFilename !== $preferredFilename) {
            if (!file_exists($preferredPath)) {
                if (@rename($existingPath, $preferredPath)) {
                    $existingPath = $preferredPath;
                    $existingFilename = $preferredFilename;
                }
            }
        }

        if ($existingFilename === $preferredFilename) {
            $targetPath = $existingPath;
        } else {
            $targetPath = $existingPath;
        }
    } elseif (file_exists($preferredPath)) {
        $targetPath = $preferredPath;
    }

    if (file_put_contents($targetPath, $contents, LOCK_EX) === false) {
        throw new RuntimeException('Unable to write summary file.');
    }

    return 'summary/' . basename($targetPath);
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
        $currentSummaryLink = null;
        $stmt = $conn->prepare('SELECT summary_link FROM projects WHERE id = ?');
        if (!$stmt) {
            throw new RuntimeException('Failed to prepare summary lookup statement: ' . $conn->error);
        }
        $stmt->bind_param('i', $id);
        if (!$stmt->execute()) {
            throw new RuntimeException('Failed to lookup existing summary: ' . $stmt->error);
        }
        $result = $stmt->get_result();
        $row = $result ? $result->fetch_assoc() : null;
        $stmt->close();

        if (!$row) {
            throw new RuntimeException('Project not found.');
        }
        $currentSummaryLink = $row['summary_link'] ?? null;

        $summaryLink = null;
        if ($summary !== '') {
            $summaryLink = write_summary_file($summaryDir, $id, $name, $summary, $currentSummaryLink);
        }

        if ($summaryLink !== null) {
            $sql = 'UPDATE projects SET name = ?, customer = ?, owner = ?, status = ?, stage = ?, model = ?, sku = ?, begin_date = ?, end_date = ?, summary_link = ?, updated_at = NOW() WHERE id = ?';
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
            $sql = 'UPDATE projects SET name = ?, customer = ?, owner = ?, status = ?, stage = ?, model = ?, sku = ?, begin_date = ?, end_date = ?, updated_at = NOW() WHERE id = ?';
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
        $sql = 'INSERT INTO projects (name, customer, owner, status, stage, model, sku, begin_date, end_date, summary_link, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())';
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
            $summaryLink = write_summary_file($summaryDir, $id, $name, $summary, null);
            $stmt = $conn->prepare('UPDATE projects SET summary_link = ? WHERE id = ?');
            if ($stmt) {
                $stmt->bind_param('si', $summaryLink, $id);
                $stmt->execute();
                $stmt->close();
            }
        }
    }

    $stmt = $conn->prepare('SELECT id, name, customer, owner, status, stage, model, sku, begin_date, end_date, summary_link, updated_at FROM projects WHERE id = ?');
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

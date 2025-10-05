<?php
declare(strict_types=1);
require_once("src/config/pdo_db.php");

/**
 * Insert or update an event.
 * POST fields:
 * - project_id (int, required)
 * - event_id (int, optional: if provided → update; else → insert)
 * - title (string, required)
 * - date (YYYY/MM/DD or YYYY-MM-DD, required)
 * - time_start (HH:mm, optional)
 * - time_end   (HH:mm, optional)
 * - linked_task (string, optional)
 * - status ('Planned'|'In Progress'|'Done'|'Blocked', optional)
 * - note (string, optional)
 */

$project_id = require_int($_POST['project_id'] ?? null, 'project_id');
$title = trim($_POST['title'] ?? '');
if ($title === '') json_error('INVALID_PARAM', 'title is required', 422);

$event_date = normalize_date($_POST['date'] ?? null);
if (!$event_date) json_error('INVALID_PARAM', 'date must be YYYY/MM/DD or YYYY-MM-DD', 422);

$time_start  = normalize_time($_POST['time_start'] ?? null);
$time_end    = normalize_time($_POST['time_end'] ?? null);
$linked_task = trim($_POST['linked_task'] ?? '');
$status      = $_POST['status'] ?? 'Planned';
$note        = trim($_POST['note'] ?? '');

$allowed_status = ['Planned','In Progress','Done','Blocked'];
if (!in_array($status, $allowed_status, true)) $status = 'Planned';

$event_id_raw = $_POST['event_id'] ?? '';
$mode = 'insert';

try {
    if ($event_id_raw !== '' && ctype_digit((string)$event_id_raw)) {
        // UPDATE
        $event_id = (int)$event_id_raw;
        $sql = "UPDATE project_events
                SET title = :title,
                    event_date = :event_date,
                    time_start = :time_start,
                    time_end = :time_end,
                    linked_task = :linked_task,
                    status = :status,
                    note = :note
                WHERE id = :id AND project_id = :project_id";
        $stmt = pdo()->prepare($sql);
        $stmt->execute([
            ':title'       => $title,
            ':event_date'  => $event_date,
            ':time_start'  => $time_start,
            ':time_end'    => $time_end,
            ':linked_task' => $linked_task ?: null,
            ':status'      => $status,
            ':note'        => $note ?: null,
            ':id'          => $event_id,
            ':project_id'  => $project_id,
        ]);
        // if ($stmt->rowCount() === 0) {
        //     json_error('NOT_FOUND', 'Event not found for given project_id', 404);
        // }
        $mode = 'update';
        json_success(['id' => $event_id, 'mode' => $mode]);
    } else {
        // INSERT
        $sql = "INSERT INTO project_events
                (project_id, title, event_date, time_start, time_end, linked_task, status, note)
                VALUES (:project_id, :title, :event_date, :time_start, :time_end, :linked_task, :status, :note)";
        $stmt = pdo()->prepare($sql);
        $stmt->execute([
            ':project_id'  => $project_id,
            ':title'       => $title,
            ':event_date'  => $event_date,
            ':time_start'  => $time_start,
            ':time_end'    => $time_end,
            ':linked_task' => $linked_task ?: null,
            ':status'      => $status,
            ':note'        => $note ?: null,
        ]);
        $new_id = (int)pdo()->lastInsertId();
        json_success(['id' => $new_id, 'mode' => $mode]);
    }
} catch (Throwable $e) {
    json_error('DB_WRITE_FAIL', 'Failed to save event.', 500, ['detail' => $e->getMessage()]);
}

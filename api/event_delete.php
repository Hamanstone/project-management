<?php
declare(strict_types=1);
require_once("src/config/pdo_db.php");

/**
 * Delete an event.
 * POST fields:
 * - project_id (int, required)
 * - event_id   (int, required)
 */
$project_id = require_int($_POST['project_id'] ?? null, 'project_id');
$event_id   = require_int($_POST['event_id'] ?? null, 'event_id');

try {
    $stmt = pdo()->prepare("DELETE FROM project_events WHERE id = :id AND project_id = :pid");
    $stmt->execute([':id' => $event_id, ':pid' => $project_id]);
    if ($stmt->rowCount() === 0) {
        json_error('NOT_FOUND', 'Event not found for given project_id', 404);
    }
    json_success();
} catch (Throwable $e) {
    json_error('DB_DELETE_FAIL', 'Failed to delete event.', 500, ['detail' => $e->getMessage()]);
}

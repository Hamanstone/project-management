USE projectdb;
ALTER TABLE projects ADD COLUMN sku VARCHAR(100) AFTER model;
ALTER TABLE `project_tasks` ADD COLUMN `description` VARCHAR(100) AFTER task_title;
ALTER TABLE `projects` ADD COLUMN `end_date` DATE NULL DEFAULT NULL AFTER begin_date;
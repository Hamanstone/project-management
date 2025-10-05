ALTER TABLE `projects`
  ADD COLUMN `summary_link` varchar(255) DEFAULT NULL AFTER `status`;

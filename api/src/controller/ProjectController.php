<?php
require_once("src/model/ProjectModel.php");

class ProjectController {
  public function getAllProjects() {
    $model = new ProjectModel();
    return $model->fetchAll();
  }

  public function saveProject($data) {
    $model = new ProjectModel();
    return $model->save($data);
  }

  public function deleteProject($id) {
    $model = new ProjectModel();
    return $model->delete($id);
  }
}
?>

$(document).ready(function () {
  // Global variables
  const AppState = {
    projectId: null,
    loadedTasks: [],
    loadedIssues: [],
    stationSelect: null,
    datePicker: null,
    isLoading: false,
    projectColors: {},
    allProjects: [],
    // **新增：儲存載入的站點數據**
    loadedStations: [],
  };

  let loadingTimeout = null;
  let nextColorIndex = 1;

  // Utility functions
  const Utils = {
    showToast(message, type = 'success') {
      const toast = $('#liveToast');
      const toastBody = $('#toastMessage');

      toast.removeClass('text-white bg-success bg-danger bg-warning').addClass(`text-white bg-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'success'}`);

      toastBody.text(message);
      new bootstrap.Toast(toast[0]).show();
    },

    showLoading(show = true, minDuration = 350) {
      $('#detailColumn').hide();
      if (show) {
        AppState.loadingStart = Date.now();
        $('#loadingSpinner').show();
        AppState.isLoading = true;
      } else {
        const elapsed = Date.now() - (AppState.loadingStart || 0);
        const remaining = minDuration - elapsed;

        clearTimeout(loadingTimeout);

        if (remaining > 0) {
          loadingTimeout = setTimeout(() => {
            $('#loadingSpinner').hide();
            $('#detailColumn').show();
            AppState.isLoading = false;
          }, remaining);
        } else {
          $('#loadingSpinner').hide();
          $('#detailColumn').show();
          AppState.isLoading = false;
        }
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('zh-TW');
    },

    validateForm(formSelector) {
      const form = $(formSelector)[0];
      form.classList.add('was-validated');
      return form.checkValidity();
    },

    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    getProjectColorClass(projectId) {
      if (!AppState.projectColors[projectId]) {
        AppState.projectColors[projectId] = `project-color-${nextColorIndex}`;
        nextColorIndex = (nextColorIndex % 6) + 1;
      }
      return AppState.projectColors[projectId];
    }
  };

  // Initialize application
  function initializeApp() {
    initializeDatePicker();
    bindEventHandlers();
    initializeToast();
    hideDetail();

    loadAllProjects()
      .then(() => {
        renderWeeklyTimeline(AppState.allProjects);
        renderProjectsTable(AppState.allProjects);
      })
      .catch(error => {
        console.error('初始化載入專案時發生錯誤:', error);
        Utils.showToast('初始化失敗，無法載入專案數據', 'error');
        renderWeeklyTimeline([]);
        renderProjectsTable([]);
      });
  }

  function initializeDatePicker() {
    AppState.datePicker = flatpickr("#dateRangePicker", {
      mode: "range",
      dateFormat: "Y-m-d",
      inline: true,
      onChange: function (selectedDates, dateStr, instance) {
        if (selectedDates.length === 2) {
          $('#begin_date').val(instance.formatDate(selectedDates[0], "Y-m-d"));
          $('#end_date').val(selectedDates[1] ? instance.formatDate(selectedDates[1], "Y-m-d") : '');
        } else {
          $('#begin_date').val('');
          $('#end_date').val('');
        }
      }
    });
  }

  function initializeToast() {
    const toastEl = document.getElementById('liveToast');
    if (toastEl) {
      AppState.toastInstance = new bootstrap.Toast(toastEl);
    }
  }

  function bindEventHandlers() {
    $(document).on("click", "#closeBtn", hideDetail);
    $(document).on("change", ".task-status", Utils.debounce(function (e) {
      const $select = $(e.target).closest("select.task-status");
      const id = $select.data("id");
      const status = $select.val();
      if (!id || !status) return;
      updateTaskStatus(AppState.projectId, id, status);
    }, 300));

    $(document).on("change", ".issue-status", Utils.debounce(function(e) {
      const $select = $(e.target).closest("select.issue-status");
      const id = $select.data("id");
      const status = $select.val();
      if (!id || !status) return;
      updateIssueStatus(AppState.projectId, id, status);
    }, 300));

    $(document).on("click", ".summary-item", handleSummaryItemClick);

    // Form submissions
    $('#projectForm').on('submit', handleProjectSubmit);
    $('#stationForm').on('submit', handleStationSubmit);
    $('#taskForm').on('submit', handleTaskSubmit);
    $('#issueForm').on('submit', handleIssueSubmit);
  }

  // UI Functions
  function showDetail() {
    $('#leftColumn').removeClass('full-width').addClass('col-md-5');
    $('#detailColumn')
      .removeClass('hidden')
      .css({ display: 'block' });
  }

  function hideDetail() {
    $('#detailColumn')
      .addClass('hidden');

    setTimeout(() => {
      $('#leftColumn').removeClass('col-md-5').addClass('full-width');
      $('#detailColumn').css({ display: 'none' });
    }, 300);
  }

  // Main functions
  window.loadDetail = function(projectId) {
    if (AppState.isLoading) return;

    Utils.showLoading(true);
    AppState.projectId = projectId;

    $.get('api/ajax_project_detail.php', { project_id: projectId })
      .done(function(res) {
        if (res.project) {
          $('#projectTitle').text(res.project.name || '專案名稱');
          showDetail();
          populateProjectForm(res.project);
          // **修改：呼叫修改後的 loadStations 函數，它會自行載入並渲染**
          loadStations(projectId);
          loadTasks(projectId);
          loadIssues(projectId);
          initializeStationSelect(projectId);
        }
      })
      .fail(function() {
        Utils.showToast('載入專案詳情失敗', 'error');
      })
      .always(function() {
        Utils.showLoading(false);
      });
  }

  function populateProjectForm(project) {
    $('#proj_id').val(project.id);
    $('#proj_name').val(project.name);
    $('#proj_sku').val(project.sku);
    $('#proj_stage').val(project.stage);
    $('#proj_owner').val(project.owner);
    $('#proj_status').val(project.status);
    $('#station_pid, #issue_pid, #task_pid').val(project.id);
    $('#begin_date').val(project.begin_date);
    $('#end_date').val(project.end_date);

    if (AppState.datePicker && project.begin_date && project.end_date) {
      AppState.datePicker.setDate([project.begin_date, project.end_date], true);
    }
  }

  // **新增：獨立的渲染站點表格函數**
  function renderStationsTable(stations) {
    const rows = stations.map(s => `
      <tr data-sid="${s.idx}">
        <td class="fw-semibold">${htmlspecialchars(s.station_name)}</td>
        <td><code>${htmlspecialchars(s.machine_number)}</code></td>
        <td><code>${htmlspecialchars(s.device_id)}</code></td>
        <td><code>${htmlspecialchars(s.ip_address)}</code></td>
        <td>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteStation(${s.idx})" title="刪除站點">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');

    $('#stationList').html(rows || '<tr><td colspan="5" class="text-muted text-center">暫無資料</td></tr>');
  }

  // **修改：loadStations 函數只負責獲取數據**
  function loadStations(projectId) {
    $.getJSON("api/ajax_stations_by_project.php", { project_id: projectId }) // 假設有這個 API
      .done(function(data) {
        AppState.loadedStations = data; // 儲存數據
        renderStationsTable(data); // 呼叫渲染函數
      })
      .fail(function() {
        Utils.showToast('載入站點失敗', 'error');
        renderStationsTable([]); // 載入失敗也渲染空表格
      });
  }

  function loadTasks(projectId) {
    $.getJSON("api/ajax_tasks_by_project.php", { project_id: projectId })
      .done(function(data) {
        AppState.loadedTasks = data;
        updateOngoingSummary();

        const rows = data.map(t => `
          <tr>
            <td class="fw-semibold">${htmlspecialchars(t.task_title)}</td>
            <td>
              <select class="form-select form-select-sm task-status" data-id="${t.id}">
                <option value="Pending"${t.status === 'Pending' ? ' selected' : ''}>待處理</option>
                <option value="Ongoing"${t.status === 'Ongoing' ? ' selected' : ''}>進行中</option>
                <option value="Done"${t.status === 'Done' ? ' selected' : ''}>已完成</option>
              </select>
            </td>
            <td>${htmlspecialchars(t.owner || '-')}</td>
            <td class="text-muted small">${Utils.formatDate(t.created_at)}</td>
          </tr>
        `).join('');

        $('#taskList').html(rows || '<tr><td colspan="4" class="text-muted text-center">暫無任務</td></tr>');
      })
      .fail(function() {
        Utils.showToast('載入任務失敗', 'error');
      });
  }

  function loadIssues(projectId) {
    $.getJSON("api/ajax_issues_by_project.php", { project_id: projectId })
      .done(function(data) {
        AppState.loadedIssues = data;
        updateOngoingSummary();

        const rows = data.map(issue => `
          <tr>
            <td class="fw-semibold">${htmlspecialchars(issue.issue_title)}</td>
            <td>
              <select class="form-select form-select-sm issue-status" data-id="${issue.id}">
                <option value="In Progress"${issue.status === 'In Progress' ? ' selected' : ''}>處理中</option>
                <option value="Pending"${issue.status === 'Pending' ? ' selected' : ''}>待處理</option>
                <option value="Resolved"${issue.status === 'Resolved' ? ' selected' : ''}>已解決</option>
                <option value="Closed"${issue.status === 'Closed' ? ' selected' : ''}>已關閉</option>
              </select>
            </td>
            <td>${htmlspecialchars(issue.owner || '-')}</td>
            <td class="text-muted small">${Utils.formatDate(issue.created_at)}</td>
          </tr>
        `).join('');

        $('#issueList').html(rows || '<tr><td colspan="4" class="text-muted text-center">暫無問題</td></tr>');
      })
      .fail(function() {
        Utils.showToast('載入問題失敗', 'error');
      });
  }

  function updateOngoingSummary() {
    const container = $('#ongoingSummary');
    container.empty();

    const ongoingTasks = AppState.loadedTasks.filter(t => t.status === 'Ongoing');
    const inProgressIssues = AppState.loadedIssues.filter(i => i.status === 'In Progress');

    if (ongoingTasks.length === 0 && inProgressIssues.length === 0) {
      container.html('<div class="text-muted text-center py-3"><i class="fas fa-check-circle me-2"></i>目前沒有進行中的項目</div>');
      return;
    }

    ongoingTasks.forEach(task => {
      container.append(`
        <div class="summary-item task" data-id="${task.id}" data-type="task">
          <i class="fas fa-tasks text-primary me-2"></i>
          <strong>任務:</strong> ${htmlspecialchars(task.task_title)}
          <small class="text-muted ms-2">(${htmlspecialchars(task.owner || '未指定負責人')})</small>
        </div>
      `);
    });

    inProgressIssues.forEach(issue => {
      container.append(`
        <div class="summary-item issue" data-id="${issue.id}" data-type="issue">
          <i class="fas fa-exclamation-triangle text-warning me-2"></i>
          <strong>問題:</strong> ${htmlspecialchars(issue.issue_title)}
          <small class="text-muted ms-2">(${htmlspecialchars(issue.owner || '未指定負責人')})</small>
        </div>
      `);
    });
  }

  function initializeStationSelect(projectId) {
    if (AppState.stationSelect) {
      AppState.stationSelect.destroy();
      AppState.stationSelect = null;
    }

    $('#station_name_select').empty();

    $.getJSON("api/get_station_names_by_project.php", { project_id: projectId }, function (data) {
      AppState.stationSelect = new TomSelect("#station_name_select", {
        create: true,
        placeholder: "選擇或輸入 Station 名稱"
      });

      data.forEach(n => AppState.stationSelect.addOption({ value: n, text: n }));
      AppState.stationSelect.refreshOptions();
    });
  }


  // Form handlers
  function handleProjectSubmit(e) {
    e.preventDefault();

    if (!Utils.validateForm('#projectForm')) {
      Utils.showToast('請填寫必要欄位', 'warning');
      return;
    }

    const formData = $(this).serialize();
    const projectData = $(this).serializeArray().reduce((obj, field) => {
      obj[field.name] = field.value;
      return obj;
    }, {});

    $.post('api/save_project_ajax.php', formData)
      .done(function() {
        updateProjectRow(projectData);
        Utils.showToast('專案資料已儲存');
        loadAllProjects().then(() => {
          renderWeeklyTimeline(AppState.allProjects);
          renderProjectsTable(AppState.allProjects);
        });
      })
      .fail(function() {
        Utils.showToast('儲存失敗，請稍後重試', 'error');
      });
  }

  function handleStationSubmit(e) {
    e.preventDefault();

    if (!Utils.validateForm('#stationForm')) {
      Utils.showToast('請填寫必要欄位', 'warning');
      return;
    }

    const deviceId = $(this).find('[name=device_id]').val().trim();
    if (!deviceId) {
      Utils.showToast('請輸入設備 ID', 'warning');
      return;
    }

    $.post("api/add_station_ajax.php", $(this).serialize())
      .done(function() {
        // **修改：新增站點後重新載入並渲染站點列表**
        loadStations(AppState.projectId);
        $('#stationForm')[0].reset();
        Utils.showToast("站點新增完成");
      })
      .fail(function() {
        Utils.showToast('新增站點失敗', 'error');
      });
  }

  function handleTaskSubmit(e) {
    e.preventDefault();

    if (!Utils.validateForm('#taskForm')) {
      Utils.showToast('請填寫任務標題', 'warning');
      return;
    }

    $.post("api/add_task_ajax.php", $(this).serialize())
      .done(function(response) {
        updateProjectCounts(AppState.projectId, "task", response);
        loadTasks($('#task_pid').val());
        $('#taskForm')[0].reset();
        Utils.showToast("任務新增完成");
      })
      .fail(function() {
        Utils.showToast('新增任務失敗', 'error');
      });
  }

  function handleIssueSubmit(e) {
    e.preventDefault();

    if (!Utils.validateForm('#issueForm')) {
      Utils.showToast('請填寫問題標題', 'warning');
      return;
    }

    $.post("api/add_issue_ajax.php", $(this).serialize())
      .done(function(response) {
        updateProjectCounts(AppState.projectId, "issue", response);
        loadIssues($('#issue_pid').val());
        $('#issueForm')[0].reset();
        Utils.showToast("問題新增完成");
      })
      .fail(function() {
        Utils.showToast('新增問題失敗', 'error');
      });
  }

  // Update Project table functions
  function updateProjectRow(projectData) {
    console.log(projectData);
    const row = $(`.project-row[data-id="${projectData.id}"]`);
    if (row.length) {
      row.find("td").eq(0).text("#" + projectData.id + " " + projectData.name);
      row.find("td").eq(2).html(`${projectData.sku}`);
      row.find("td").eq(5).text(projectData.owner);
      row.find("td").eq(6).html(`<span class="badge bg-info rounded-pill">${projectData.stage}</span>`);
      row.find("td").eq(7).html(getStatusBadgeJS(projectData.status));
    }
  }

  function updateProjectCounts(project_id, type, count) {
    const row = $(`.project-row[data-id="${project_id}"]`);
    if (row.length && type == "task") {
      row.find("td").eq(3).text(count);
    }
    else if(row.length && type == "issue") {
      row.find("td").eq(4).text(count);
    }
  }

  function updateTaskStatus(project_id, id, status) {
    console.log("hello");
    $.post("api/update_task_status.php", { project_id: project_id, id: id, status: status }).done(function(response) {
        updateProjectCounts(project_id, "task", response);
        loadTasks(AppState.projectId);
        Utils.showToast("任務狀態已更新");
    });
  }

  function updateIssueStatus(project_id, id, status) {
    $.post("api/update_issue_status.php", { project_id: project_id, id: id, status: status }).done(function(response) {
      updateProjectCounts(project_id, "issue", response);
      loadIssues(AppState.projectId);
      Utils.showToast("問題狀態已更新");
    });
  }


  // Delete functions
  window.deleteStation = function(id) { // 使其可在 HTML 中直接呼叫
    if (!confirm('確定要刪除這個站點嗎？此操作無法復原。')) {
      return;
    }

    $.post('api/delete_station_ajax.php', { id })
      .done(function() {
        Utils.showToast('站點已刪除');
        // **修改：刪除後重新載入並渲染站點列表**
        loadStations(AppState.projectId);
      })
      .fail(function() {
        Utils.showToast('刪除失敗', 'error');
      });
  }

  function loadAllProjects() {
    return fetch('api/projects.php')
      .then(response => {
        if (!response.ok) {
          throw new Error('網路回應不正常 ' + response.statusText);
        }
        return response.json();
      })
      .then(projects => {
        AppState.allProjects = projects;
        return projects;
      })
      .catch(error => {
        console.error('載入所有專案時發生錯誤:', error);
        Utils.showToast('載入所有專案失敗，請稍後再試。', 'error');
        AppState.allProjects = [];
        return [];
      });
  }

  function renderProjectsTable(projects) {
    console.log('renderProjectsTable 被呼叫了');
    const $projectTableBody = $('#projectTableBody'); // 使用 $ 開頭的變數名表示 jQuery 物件
    const projectCount = $('#projectCount'); // 這裡我假設您的 ID 是 projectCount，而不是 projectCountElement

    $projectTableBody.html(''); // 使用 .html() 來設定內容，清空表格
    if (projects.length === 0) {
      $projectTableBody.html('<tr><td colspan="8" class="text-center">目前沒有專案。</td></tr>');
      projectCount.text('共 0 個專案'); // 使用 .text() 來設定文字內容
      return;
    }

    // 使用一個陣列來儲存所有行的 HTML 字串，然後一次性加入，效率更高
    const rowsHtml = projects.map(p => {
      // 直接返回字串，jQuery 的 .append() 可以處理 HTML 字串
      return `
        <tr class="project-row" data-id="${p.id}" onclick="loadDetail(${p.id})">
          <td class="fw-semibold">#${p.id} ${htmlspecialchars(p.name)}</td>
          <td>${htmlspecialchars(p.customer)}</td>
          <td>${htmlspecialchars(p.sku)}</td>
          <td>${htmlspecialchars(p.tasks_count)}</td>
          <td>${htmlspecialchars(p.issues_count)}</td>
          <td>${htmlspecialchars(p.owner)}</td>
          <td><span class="badge bg-info rounded-pill">${htmlspecialchars(p.stage)}</span></td>
          <td>${getStatusBadgeJS(p.status)}</td>
        </tr>
      `;
    }).join(''); // 將所有行字串連接起來

    $projectTableBody.html(rowsHtml); // 一次性設定所有行的 HTML
    projectCount.text(`共 ${projects.length} 個專案`); // 更新專案計數
  }

  // HTML special chars escaping for JS (防止 XSS)
  function htmlspecialchars(str) {
      if (typeof str !== 'string') {
          return str;
      }
      var map = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
      };
      return str.replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  function getStatusBadgeJS(status) {
    const statusMap = {
      '啟動中': 'success',
      '測試中': 'primary',
      '驗證中': 'purple',
      '封板中': 'danger',
      '量產中': 'warning'
    };

    const badgeClass = statusMap[status] || 'secondary';
    return `<span class="badge bg-${badgeClass} rounded-pill">${htmlspecialchars(status)}</span>`;
  }

  window.refreshProjects = function() {
    Utils.showLoading(true);
    loadAllProjects().then((projects) => {
      renderProjectsTable(projects);
      renderWeeklyTimeline(projects);
    }).finally(() => {
      Utils.showLoading(false);
    });
  }

  $('#exportData').on('click', function () {
    if (!AppState.projectId) {
      Utils.showToast('請先選擇一個專案', 'warning');
      return;
    }

    // 找到當前專案
    const currentProject = AppState.allProjects.find(p => p.id == AppState.projectId);

    if (currentProject) {
      Utils.showToast(`正在匯出專案資料: ${htmlspecialchars(currentProject.name)}`, 'info');
    } else {
      Utils.showToast('匯出功能開發中', 'info');
    }
  });

  function renderWeeklyTimeline(projects) {
    const timelineHeader = $('#timelineHeader');
    const timelineBody = $('#timelineBody');
    timelineHeader.empty();
    timelineBody.empty();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDayOfWeek = today.getDay();
    const diffToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const mondayOfThisWeek = new Date(today);
    mondayOfThisWeek.setDate(today.getDate() - diffToMonday);

    const datesToShow = [];
    for (let i = 0; i < 14; i++) {
        const date = new Date(mondayOfThisWeek);
        date.setDate(mondayOfThisWeek.getDate() + i);
        datesToShow.push(date);
    }

    const displayEndDate = datesToShow[datesToShow.length - 1];

    let headerHtml = '<th style="min-width: 150px;">專案名稱</th>';
    datesToShow.forEach(date => {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
        const isToday = date.toDateString() === today.toDateString();
        const headerClass = isToday ? 'bg-success fw-bold' : 'fw-medium';
        headerHtml += `<th class="${headerClass}">${month}/${day}<br>(${dayOfWeek})</th>`;
    });
    timelineHeader.html(headerHtml);

    if (projects && projects.length > 0) {
      projects.forEach(project => {
        const projectStartDate = project.begin_date ? new Date(project.begin_date) : null;
        const projectEndDate = project.end_date ? new Date(project.end_date) : null;

        if (projectStartDate) projectStartDate.setHours(0, 0, 0, 0);
        if (projectEndDate) projectEndDate.setHours(0, 0, 0, 0);

        if (!projectStartDate || !projectEndDate ||
          projectEndDate < mondayOfThisWeek ||
          projectStartDate > displayEndDate
        ) {
          return;
        }

        const projectColorClass = Utils.getProjectColorClass(project.id);

        let rowHtml = `<tr class="${projectColorClass}">`;
        rowHtml += `<th scope="row" onclick="loadDetail(${project.id})" style="cursor: pointer;">${htmlspecialchars(project.name)} ${htmlspecialchars(project.sku)}</th>`;

        datesToShow.forEach(currentDate => {
          let cellClass = '';
          let cellText = '';

          const isInProjectRange = projectStartDate && projectEndDate &&
            currentDate >= projectStartDate &&
            currentDate <= projectEndDate;

          if (isInProjectRange && (currentDate < today)) {
            cellClass = 'inactive-date';
            cellText = '<i class="fas fa-xmark"></i>';
          } else if (isInProjectRange && (currentDate >= today)) {
            cellClass = 'active-date';
            cellText = '';
          } else if (currentDate < today) {
            cellClass = 'past-date';
            cellText = '';
          } else {
            cellClass = 'future-date';
            cellText = '';
          }

          rowHtml += `<td class="${cellClass}">${cellText}</td>`;
        });
        rowHtml += '</tr>';
        timelineBody.append(rowHtml);
      });
    } else {
      timelineBody.html('<tr><td colspan="15" class="text-muted text-center py-3">暫無專案時程數據</td></tr>');
    }
  }


  function handleSummaryItemClick() {
    const type = $(this).data('type');
    const id = $(this).data('id');
    let item = null;

    if (type === 'task') {
      item = AppState.loadedTasks.find(t => t.id == id);
    } else if (type === 'issue') {
      item = AppState.loadedIssues.find(i => i.id == id);
    }

    if (!item) {
      Utils.showToast('⚠ 無法找到對應的項目');
      return;
    }

    $('#item_id').val(item.id);
    $('#item_type').val(type);
    $('#item_title').val(item.task_title || item.issue_title || '');
    $('#item_owner').val(item.owner || '');
    $('#item_description').val(item.description || '');

    const statusOptions = type === 'task'
      ? ['Pending', 'Ongoing', 'Done']
      : ['In Progress', 'Pending', 'Resolved', 'Closed'];

    const $status = $('#item_status');
    $status.empty();
    statusOptions.forEach(opt => {
      $status.append(`<option value="${opt}" ${item.status === opt ? 'selected' : ''}>${opt}</option>`);
    });

    $('#itemModalLabel').text(type === 'task' ? '任務詳情' : '問題詳情');

    const modal = new bootstrap.Modal(document.getElementById('itemModal'));
    modal.show();
  }

  $('#saveItemBtn').on('click', function () {
    const type = $('#item_type').val();
    const project_id = AppState.projectId;
    const id = $('#item_id').val();
    const title = $('#item_title').val().trim();
    const owner = $('#item_owner').val().trim();
    const status = $('#item_status').val();
    const description = $('#item_description').val().trim();

    if (!title) {
      Utils.showToast('⚠ 標題不可為空');
      return;
    }

    const payload = {
      project_id,
      id,
      title,
      owner,
      status,
      description
    };
    console.log(payload);

    const endpoint = type === 'task'
      ? 'api/update_task_detail.php'
      : 'api/update_issue_detail.php';

    $.post(endpoint, payload).done(function(response) {
      Utils.showToast('✅ 已儲存變更');

      let list = type === 'task' ? AppState.loadedTasks : AppState.loadedIssues;
      let item = list.find(x => x.id == id);
      if (item) {
        if (type === 'task') item.task_title = title;
        if (type === 'issue') item.issue_title = title;
        item.owner = owner;
        item.status = status;
        item.description = description;
      }

      if (type === 'task') {
        updateProjectCounts(AppState.projectId, "task", response);
        loadTasks(AppState.projectId);
      } else {
        updateProjectCounts(AppState.projectId, "issue", response);
        loadIssues(AppState.projectId);
      }

      updateOngoingSummary();

      const modal = bootstrap.Modal.getInstance(document.getElementById('itemModal'));
      modal.hide();
    });
  });

  $(document).ready(function() {
    initializeApp();
  });

  $(document).keydown(function(e) {
    if (e.keyCode === 27) {
      hideDetail();
    }

    if (e.ctrlKey && e.keyCode === 82) {
      e.preventDefault();
      refreshProjects();
    }
  });
});

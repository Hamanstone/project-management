globalThis.GLOBAL_PROJECTS = globalThis.GLOBAL_PROJECTS || [];


/**
 * 根據 id 回傳專案資料
 */
function getProjectScheduleById(id) {
	if (!Array.isArray(GLOBAL_PROJECTS)) return null;
	return GLOBAL_PROJECTS.find(project => project.id == id) || null;
}

/**
 * 根據專案 ID 取得 schedule 的第一天與最後一天（格式：July 9, 2025）
 */
function getScheduleRangeById(id) {
	const project = getProjectScheduleById(id);
	if (!project || !project.schedule || typeof project.schedule !== 'object') return null;

	const dates = Object.keys(project.schedule)
		.filter(date => project.schedule[date])
		.sort();

	if (dates.length === 0) return null;

	const formatter = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	const start = formatter.format(new Date(dates[0]));
	const end = formatter.format(new Date(dates[dates.length - 1]));

	return { start, end };
}

/**
 * 生成三週時程表格（包含週末，但週末底色不同）
 */
function renderScheduleTable(data, containerId, days = 21) {
	const todayStr = new Date().toISOString().split('T')[0];
	const highlightTHColor = 'bg-purple-100';
	const highlightTDColor = 'bg-purple-50';
	const weekendTHColor = 'bg-neutral-200';
	const weekendTDColor = 'bg-neutral-100';

	const colorMap = {
		green: 'bg-green-300 hover:bg-green-400',
		orange: 'bg-orange-300 hover:bg-orange-400',
		red: 'bg-red-300 hover:bg-red-400',
		yellow: 'bg-yellow-300 hover:bg-yellow-400',
		purple: 'bg-purple-300 hover:bg-purple-400',
		blue: 'bg-blue-300 hover:bg-blue-400',
		indigo: 'bg-indigo-300 hover:bg-indigo-400',
		pink: 'bg-pink-300 hover:bg-pink-400',
		teal: 'bg-teal-300 hover:bg-teal-400',
		cyan: 'bg-cyan-300 hover:bg-cyan-400'
	};

	const startDate = new Date();
	let skipped = 0;
	while (skipped < 5) {
		startDate.setDate(startDate.getDate() - 1);
		const day = startDate.getDay();
		if (day !== 0 && day !== 6) skipped++;
	}

	const workDays = generateWorkdays(startDate, days);
	const workDayFullDates = new Set(workDays.map(d => d.full));

	const filteredProjects = data.filter(project => {
		for (const date in project.schedule) {
			if (project.schedule.hasOwnProperty(date) && workDayFullDates.has(date)) {
				return true;
			}
		}
		return false;
	});

	const $table = $('#' + containerId);
	$table.empty();

	const $thead = $('<thead><tr class="bg-neutral-50"></tr></thead>');
	const $theadRow = $thead.find('tr');
	$theadRow.append('<th class="px-2 py-3 text-left text-[#141414] text-[11px] w-[200px] whitespace-nowrap">Project</th>');

	workDays.forEach(d => {
		const isToday = d.full === todayStr;
		const isWeekend = d.week === 'Sat' || d.week === 'Sun';
		let extraClass = '';
		if (isToday) extraClass = highlightTHColor; else if (isWeekend) extraClass = weekendTHColor;
		$theadRow.append(`
			<th class="text-[#141414] text-[11px] whitespace-nowrap border ${extraClass}">
				${d.week}<br><span class="text-xs">${d.date}</span>
			</th>
		`);
	});

	$theadRow.append('<th class="text-center text-[#141414] text-[11px] whitespace-nowrap">&nbsp;</th>');

	const $tbody = $('<tbody></tbody>');
	filteredProjects.forEach(project => {
		const $row = $('<tr class="border-t border-[#dbdbdb]"></tr>');
		$row.append(`
			<td class="sticky left-0 z-20 bg-neutral-50 px-2 py-2 w-[200px] text-left text-[#101518] text-[11px] font-bold whitespace-nowrap">
				<button class="text-left text-blue-600 underline hover:text-blue-800 project-trigger " data-id="${project.id}" data-name="${project.name}" style="all:unset;cursor:pointer;">
					<span class="text-gray-400">#${project.id}</span>&nbsp;&nbsp;${project.name}
				</button>
			</td>
		`);

		workDays.forEach((day, i) => {
			const color = project.schedule[day.full];
			const colorClass = colorMap[color] || '';
			const rounded = getRoundedClass(i, project.schedule, workDays);
			const isToday = day.full === todayStr;
			const isWeekend = day.week === 'Sat' || day.week === 'Sun';

			let cellBgClass = '';
			if (isToday) cellBgClass = highlightTDColor; else if (isWeekend) cellBgClass = weekendTDColor;

			const tooltipText = `${project.name}, ${day.week}, ${day.date}`;
			const content = color
				? `${parseInt(day.date.split('/')[1])}
					 <div class="relative group h-2">
						 <div class="h-2 ${colorClass} ${rounded} cursor-pointer"></div>
						 <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
							 ${tooltipText}
						 </div>
					 </div>`
				: '';

			$row.append(`<td class="px-0 py-2 text-center text-[10px] border ${cellBgClass}">${content}</td>`);
		});

		$row.append('<td class="px-0 py-2 text-center"></td>');
		$tbody.append($row);
	});

	$table.append($thead);
	$table.append($tbody);

	function generateWorkdays(startDate, count) {
		const days = [];
		const date = new Date(startDate);
		while (days.length < count) {
			days.push({
				full: date.toISOString().split('T')[0],
				date: `${date.getMonth() + 1}/${date.getDate()}`,
				week: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getDay()]
			});
			date.setDate(date.getDate() + 1);
		}
		return days;
	}

	function getRoundedClass(index, schedule, workDays) {
		const dayKey = workDays[index].full;
		const current = schedule[dayKey];
		if (!current) return '';

		const prevKey = index> 0 ? workDays[index - 1].full : null;
		const nextKey = index < workDays.length - 1 ? workDays[index + 1].full : null;

		const prevHasSameColor = prevKey && schedule[prevKey] === current;
		const nextHasSameColor = nextKey && schedule[nextKey] === current;

		const isBlockStartVisual = !prevHasSameColor;
		const isBlockEndVisual = !nextHasSameColor;

		const isFirstDayOfDisplayRange = (index === 0);
		const isLastDayOfDisplayRange = (index === workDays.length - 1);

		let roundedClass = '';

		if (isBlockStartVisual && isBlockEndVisual) {
			if (!isFirstDayOfDisplayRange && !isLastDayOfDisplayRange) {
				roundedClass = 'rounded-full';
			}
		} else if (isBlockStartVisual) {
			if (!isFirstDayOfDisplayRange) {
				roundedClass = 'rounded-l-full';
			}
		} else if (isBlockEndVisual) {
			if (!isLastDayOfDisplayRange) {
				roundedClass = 'rounded-r-full';
			}
		}

		return roundedClass;
	}
}

// For Modal content
function renderScheduleInfo(start, end) {
	return `
		<div class="lg:col-span-2 flex gap-1">
			<div class="w-24 text-gray-400 flex items-center">
				<i class="fa-regular fa-calendar-days mr-2"></i>Schedule
			</div>
			<div class="text-gray-700 text-xs">${start} <i class="fa-solid fa-arrow-right"></i> ${end}</div>
		</div>
	`;
}

function renderInfoRow(iconClass, label, contentHtml) {
	return `
		<div class="flex gap-1">
			<div class="w-24 text-gray-400 flex items-center">
				<i class="${iconClass} mr-2"></i>${label}
			</div>
			<div>${contentHtml}</div>
		</div>
	`;
}

function renderPropertySection(project) {
	return `
		<div class="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-4 text-xs">
			${renderScheduleInfo(project.begin_date, project.end_date)}
			${renderInfoRow('fa-solid fa-qrcode', 'SKU', `<span class="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800">${project.sku || ''}</span>` )}
			${renderInfoRow('fa-solid fa-icons', 'Category', `<span class="px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">${project.category || ''}</span>` )}
			${renderInfoRow('fa-solid fa-location-dot', 'Location', `<span class="px-2 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-800">${project.location || ''}</span>` )}
			${renderInfoRow('fa-solid fa-user', 'DRI', `<span class="px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800">${project.owner || ''}</span>` )}
			${renderInfoRow('fa-solid fa-bars-staggered', 'Stage', `<span class="px-2 py-0.5 rounded-md text-xs font-medium bg-lime-100 text-lime-800">${project.stage || ''}</span>` )}
			${renderInfoRow('fa-solid fa-circle-check', 'Status', `<span class="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">${project.status || ''}</span>` )}
			${renderInfoRow('fa-solid fa-paperclip', 'Attachment', `<span class="text-gray-400 italic">${project.attachment || 'Empty'}</span>` )}
		</div>
	`;
}

function renderTabs() {
	return `
		<div class="border-b border-gray-200 px-6 pt-2">
			<ul class="flex flex-wrap -mb-px text-sm font-semibold text-center" id="timelineTabs">
				<li class="mr-2">
					<button class="inline-block p-2 rounded-t border-b-2 border-stone-500 hover:border-gray-300 text-stone-700" data-tab="timeline">
						<i class="fa-solid fa-timeline mr-2"></i>Timeline
					</button>
				</li>
				<li class="mr-2">
					<button class="inline-block p-2 rounded-t border-b-2 border-transparent hover:border-gray-300" data-tab="tasks">
						<i class="fa-solid fa-list-check mr-2"></i>Tasks
					</button>
				</li>
				<li class="mr-2">
					<button class="inline-block p-2 rounded-t border-b-2 border-transparent hover:border-gray-300" data-tab="issues">
						<i class="fa-solid fa-bug mr-2"></i>Issues
					</button>
				</li>
				<li class="mr-2">
					<button class="inline-block p-2 rounded-t border-b-2 border-transparent hover:border-gray-300" data-tab="team">
						<i class="fa-solid fa-users mr-2"></i>Team</button>
				</li>
			</ul>
		</div>
	`;
}

// ★ 修改：帶入 projectId，並為 Add Event 按鈕加上 .btn-add-event
function renderTimelineTab(items = [], projectId) {
  // 安全轉義，避免 title/note 含引號破壞屬性
  const esc = s => String(s ?? '')
    .replace(/&/g,'&amp;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');

  const timelineHtml = items.length
    ? items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;
        const topLine = !isFirst ? `<div class="w-[1.5px] bg-[#dbdbdb] h-2"></div>` : '';
        const bottomLine = !isLast ? `<div class="w-[1.5px] bg-[#dbdbdb] h-2 grow"></div>` : '';

        return `
          <div class="flex flex-col items-center gap-1 ${isFirst ? 'pt-3' : (isLast ? 'pb-3' : 'pt-0')}">
            ${topLine}
            <div class="text-[#141414]">
              <i class="fa-solid fa-font-awesome fa-2x"></i>
            </div>
            ${bottomLine}
          </div>

          <!-- 事件卡片：hover 才有底色；帶 data-* 提供編輯資料 -->
          <div
            class="timeline-card relative group flex flex-1 flex-col py-3 px-4 rounded-2xl hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
            data-event-id="${item.id}"
            data-title="${esc(item.title)}"
            data-date="${esc(item.date)}"
            data-time-start="${esc(item.time_start || '')}"
            data-time-end="${esc(item.time_end || '')}"
            data-linked-task="${esc(item.linked_task || '')}"
            data-status="${esc(item.status || 'Planned')}"
            data-note="${esc(item.note || '')}"
          >
            <p class="text-[#141414] text-base font-medium leading-normal">${esc(item.title)}</p>
            <p class="text-neutral-500 text-xs font-normal leading-normal">${esc(item.datetime)}</p>

            <!-- hover 才出現的刪除鈕 -->
            <button
              type="button"
              class="btn-timeline-delete hidden group-hover:flex items-center justify-center
                     absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-200 text-gray-700
                     hover:bg-red-600 hover:text-white transition-colors"
              data-id="${item.id}"
              aria-label="Delete event"
              title="Delete">
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        `;
      }).join('')
    : `<div class="col-span-2 px-3 py-4 text-neutral-500 text-sm">No events yet.</div>`;

  return `
    <div id="tab-timeline" class="tab-content" data-project-id="${projectId}">
      <div class="grid grid-cols-[40px_1fr] gap-x-2">
        ${timelineHtml}
      </div>
      <div class="flex px-4 py-3 justify-start">
        <button class="btn-add-event flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#ededed] text-[#141414] text-sm font-bold leading-normal tracking-[0.015em]">
          <span class="truncate">Add Event</span>
        </button>
      </div>
    </div>
  `;
}





function renderTasksTab(tasks = []) {
	const rowsHtml = tasks.map(task => `
		<tr class="border-t border-t-[#dbdbdb]">
			<td class="px-4 py-2 w-[400px] text-[#141414] text-sm font-normal leading-normal">${task.name}</td>
			<td class="px-4 py-2 w-[400px] text-neutral-500 text-sm font-normal leading-normal">${task.dep || 'None'}</td>
			<td class="px-4 py-2 w-60 text-sm font-normal leading-normal">
				<button class="flex min-w-[64px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#ededed] text-[#141414] text-sm font-medium leading-normal w-full">
					<span class="truncate">${task.status}</span>
				</button>
			</td>
		</tr>
	`).join('');

	return `
		<div id="tab-tasks" class="tab-content hidden">
			<div class="px-4">
				<div class="flex overflow-hidden rounded-xl border border-[#dbdbdb]">
					<table class="flex-1">
						<thead>
							<tr class="bg-neutral-50">
								<th class="px-4 py-3 text-left text-[#141414] w-[400px] text-sm font-medium leading-normal"> Task </th>
								<th class="px-4 py-3 text-left text-[#141414] w-[400px] text-sm font-medium leading-normal"> Dependencies </th>
								<th class="px-4 py-3 text-left text-[#141414] w-60 text-sm font-medium leading-normal"> Status </th>
							</tr>
						</thead>
						<tbody>
							${rowsHtml}
						</tbody>
					</table>
				</div>
				<div class="flex px-4 py-3 justify-start">
					<button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#ededed] text-[#141414] text-sm font-bold leading-normal tracking-[0.015em]">
						<span class="truncate">Add Task</span>
					</button>
				</div>
			</div>
		</div>
	`;
}

function renderIssuesTab(issues = []) {
	const rowsHtml = issues.map(issue => `
		<tr class="border-t border-t-[#dbdbdb]">
			<td class="px-4 py-2 w-[400px] text-[#141414] text-sm font-normal leading-normal">${issue.title}</td>
			<td class="px-4 py-2 w-[400px] text-neutral-500 text-sm font-normal leading-normal">${issue.linkedTask || '-'}</td>
		</tr>
	`).join('');

	return `
		<div id="tab-issues" class="tab-content hidden">
			<div class="px-4">
				<div class="flex overflow-hidden rounded-xl border border-[#dbdbdb]">
					<table class="flex-1">
						<thead>
							<tr class="bg-neutral-50">
								<th class="px-4 py-3 text-left text-[#141414] w-[400px] text-sm font-medium leading-normal">Issue</th>
								<th class="px-4 py-3 text-left text-[#141414] w-[400px] text-sm font-medium leading-normal">Linked Task</th>
							</tr>
						</thead>
						<tbody>
							${rowsHtml}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	`;
}

function renderTeamTab() {
	return `
		<div id="tab-team" class="tab-content hidden">
			<div class="flex items-center px-4 justify-start">
				<div class="overflow-visible w-[34px]">
					<div class="bg-center bg-no-repeat aspect-square bg-cover border-neutral-50 bg-[#ededed] text-neutral-500 rounded-full flex items-center justify-center size-11 border-4" ></div>
				</div>
				<div class="overflow-visible w-[34px]">
					<div class="bg-center bg-no-repeat aspect-square bg-cover border-neutral-50 bg-[#ededed] text-neutral-500 rounded-full flex items-center justify-center size-11 border-4" ></div>
				</div>
				<div class="overflow-visible w-11">
					<div class="bg-center bg-no-repeat aspect-square bg-cover border-neutral-50 bg-[#ededed] text-neutral-500 rounded-full flex items-center justify-center size-11 border-4" ></div>
				</div>
			</div>
		</div>
	`;
}

// ★ 新增：Event Editor 面板
function renderEventForm(project, event = null) {
	const eid = event?.id || '';
	const title = event?.title || '';
	const date = event?.date || '';
	const timeStart = event?.time_start || '';
	const timeEnd = event?.time_end || '';
	const linkTask = event?.linked_task || '';
	const status = event?.status || 'Planned';
	const note = event?.note || '';

	return `
		<div id="modalEventForm" class="fixed top-0 right-0 h-[calc(100%-25px)] w-[360px] bg-white shadow-lg z-50 transform translate-x-full transition-transform duration-300 ease-in-out border-l border-gray-300 rounded-l-xl flex flex-col">
			<div class="flex items-center justify-between px-4 py-3 border-b">
				<h3 class="text-base font-semibold text-gray-800">${eid ? 'Edit Event' : 'Add Event'}</h3>
				<button id="eventPanelClose" class="text-gray-500 hover:text-gray-700">
					<i class="fa-solid fa-xmark"></i>
				</button>
			</div>

			<div class="p-4 overflow-y-auto h-full">
				<input type="hidden" id="eventProjectId" value="${project.id}">
				<input type="hidden" id="eventId" value="${eid}">

				<label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
				<input id="eventTitle" class="w-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 rounded px-3 py-2 text-sm" value="${title}">

				<div class="grid grid-cols-2 gap-3 mt-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
						<input id="eventDate" placeholder="YYYY/MM/DD" class="w-full border border-gray-300 rounded px-3 py-2 text-sm" value="${date}">
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Linked Task</label>
						<input id="eventLinkedTask" class="w-full border border-gray-300 rounded px-3 py-2 text-sm" value="${linkTask}">
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3 mt-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Start</label>
						<input id="eventTimeStart" placeholder="09:00" class="w-full border border-gray-300 rounded px-3 py-2 text-sm" value="${timeStart}">
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">End</label>
						<input id="eventTimeEnd" placeholder="10:30" class="w-full border border-gray-300 rounded px-3 py-2 text-sm" value="${timeEnd}">
					</div>
				</div>

				<label class="block text-sm font-medium text-gray-700 mt-4 mb-1">Status</label>
				<select id="eventStatus" class="w-full border border-gray-300 rounded px-3 py-2 text-sm">
					<option ${status==='Planned'?'selected':''}>Planned</option>
					<option ${status==='In Progress'?'selected':''}>In Progress</option>
					<option ${status==='Done'?'selected':''}>Done</option>
					<option ${status==='Blocked'?'selected':''}>Blocked</option>
				</select>

				<label class="block text-sm font-medium text-gray-700 mt-4 mb-1">Notes</label>
				<textarea id="eventNote" rows="3" class="w-full border border-gray-300 rounded px-3 py-2 text-sm">${note}</textarea>

				<div class="mt-6 flex gap-2">
					<button id="btnSaveEvent" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Save</button>
				</div>
			</div>
		</div>
	`;
}

// ★ 修改：renderTabContents 接收 project，以傳遞 project.id 給 timeline
function renderTabContents(project) {
	const timelineData = [
		{ title: "Project Kickoff", datetime: "2024-01-15, 10:05 AM" },
		{ title: "Milestone 1 Achieved", datetime: "2024-03-01, 2:17 PM" },
		{ title: "Client Presentation", datetime: "2024-04-15, 11:26 AM" },
		{ title: "milestone", datetime: "2024-04-15, 11:01 AM" },
	];

	const tasksData = [
		{ name: 'Start SMT', dep: '', status: 'To Do' },
		{ name: 'Board Level', dep: 'SMT', status: 'In Progress' },
		{ name: 'FATP', dep: 'SMT', status: 'In Progress' },
		{ name: 'OOBA', dep: 'FATP', status: 'Blocked' },
	];

	const issuesData = [
		{ title: 'Approval Delay', linkedTask: 'Review and Approval' },
		{ title: 'Resource Constraints', linkedTask: 'Content Creation' },
		{ title: 'HDMI connector not in the right position', linkedTask: 'Environment' },
	];

	return `
		<div class="px-6 pb-4">
			${renderTimelineTab([], project.id)}
			${renderTasksTab(tasksData)}
			${renderIssuesTab(issuesData)}
			${renderTeamTab()}
		</div>
	`;
}

/**
 * 載入並渲染編輯表單。
 */
function renderEditForm(project, pickerId) {
	return `
		<div id="modalEditForm" class="fixed top-0 right-0 h-[calc(100%-25px)] w-[320px] bg-white shadow-lg z-50 transform translate-x-full transition-transform duration-300 ease-in-out border-l border-gray-300 rounded-l-xl flex flex-col">
			<div class="flex items-center justify-between px-4 py-3 border-b">
				<h3 class="text-base font-semibold text-gray-800">Project Editor</h3>
				<button id="editPanelClose" class="text-gray-500 hover:text-gray-700">
					<i class="fa-solid fa-xmark"></i>
				</button>
			</div>

			<div class="p-4 overflow-y-auto h-full">
				<!-- 必要 hidden：Project ID / Start / End -->
				<input type="hidden" id="inputProjectId" value="${project.id || ''}">
				<input type="hidden" id="inputStart" value="${project.begin_date || ''}">
				<input type="hidden" id="inputEnd" value="${project.end_date || ''}">

				<label class="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
				<input id="inputName" class="w-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 rounded px-3 py-2 text-sm" value="${project.name || ''}">

				<label class="block text-sm font-medium text-gray-700 mt-4 mb-1">Production Period</label>
				<div id="${pickerId}" class="pb-4"></div>
				<input type="text" id="dateRangeInput" class="w-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 rounded px-3 py-2 text-sm" readonly placeholder="Empty" value="${
					project.begin_date && project.end_date ? `${project.begin_date} ~ ${project.end_date}` : ''
				}"/>

				<label class="block text-sm font-medium text-gray-700 mt-4 mb-1">DRI</label>
				<input id="inputDRI" class="w-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 rounded px-3 py-2 text-sm" value="${project.owner || ''}">

				<label class="block text-sm font-medium text-gray-700 mt-4 mb-1">Location</label>
				<select id="locationSelect" class="w-full">
					${Array.from({length:26}, (_,i)=>`<option value="2F${(i+1).toString().padStart(2,'0')}">2F${(i+1).toString().padStart(2,'0')}</option>`).join('')}
					${Array.from({length:26}, (_,i)=>`<option value="3F${(i+1).toString().padStart(2,'0')}">3F${(i+1).toString().padStart(2,'0')}</option>`).join('')}
				</select>

				<label class="block text-sm font-medium text-gray-700 mt-4 mb-1">SKU</label>
				<input id="inputSKU" class="w-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 rounded px-3 py-2 text-sm" value="${project.sku || ''}">

				<label class="block text-sm font-medium text-gray-700 mt-4 mb-1">Category</label>
				<input id="inputCategory" class="w-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 rounded px-3 py-2 text-sm" value="${project.category || ''}">

				<label class="block text-sm font-medium text-gray-700 mt-4 mb-1">Stage</label>
				<input id="inputStage" class="w-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 rounded px-3 py-2 text-sm" value="${project.stage || ''}">

				<label class="block text-sm font-medium text-gray-700 mt-4 mb-1">Status</label>
				<input id="inputStatus" class="w-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 rounded px-3 py-2 text-sm" value="${project.status || ''}">

				<button id="btnSaveProject" data-id="${project.id}" class="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm w-full">
					Save
				</button>
			</div>
		</div>
	`;
}

async function loadAndRenderProject(id, name) {
	try {
		const { project } = await $.getJSON(`api/ajax_project_detail.php?project_id=${id}`);
		renderModal(project, name);
		bindModalEvents();
		initPicker(`inline-picker-${project.id}`, project);
		initLocationChoices();
		updateLocationSelect(project.location);
		refreshTimeline(project.id);

		$('#projectModal').removeClass('hidden');
	} catch (e) {
		console.error('Load failed', e);
	}
}

function renderModal(project, name) {
	const pickerId = `inline-picker-${project.id}`;
	const propertySection = renderPropertySection(project);
	const tabNavigation = renderTabs();
	const tabContents = renderTabContents(project); // ★ 修改
	const editForm = renderEditForm(project, pickerId);
	const eventForm = renderEventForm(project);     // ★ 新增

	$('#modalTitle').text(name);
	$('#modalContent').empty().append(`
		<div class="space-y-3 text-xs">
			${propertySection}
			${tabNavigation}
			${tabContents}
			${editForm}
			${eventForm}
		</div>
	`);
}

function initPicker(pickerId, project) {
	if (window.__pickers?.[pickerId]) {
		window.__pickers[pickerId].destroy();
	}
	const picker = new Litepicker({
		element: document.createElement('input'),
		inlineMode: true,
		parentEl: `#${pickerId}`,
		numberOfMonths: 1,
		singleMode: false,
		format: 'YYYY/MM/DD',
		autoApply: true,
		lang: 'en-us',
		setup: (p) => {
			p.on('selected', (start, end) => {
				const startStr = dayjs(start.dateInstance).format('YYYY/MM/DD');
				const endStr = dayjs(end.dateInstance).format('YYYY/MM/DD');
				$('#dateRangeInput').val(`${startStr} ~ ${endStr}`);
				$('#inputStart').val(startStr);
				$('#inputEnd').val(endStr);
			});
		}
	});

	if (project.begin_date && project.end_date) {
		const s = dayjs(project.begin_date).format('YYYY-MM-DD');
		const e = dayjs(project.end_date).format('YYYY-MM-DD');
		picker.setDateRange(s, e);
		$('#inputStart').val(dayjs(s).format('YYYY/MM/DD'));
		$('#inputEnd').val(dayjs(e).format('YYYY/MM/DD'));
		$('#dateRangeInput').val(`${dayjs(s).format('YYYY/MM/DD')} ~ ${dayjs(e).format('YYYY/MM/DD')}`);
	}

	if (project.location) {
		const inst = $('#locationSelect').data('choicesInstance');
		if (inst) inst.setChoiceByValue(String(project.location));
		else $('#locationSelect').val(String(project.location));
	}

	window.__pickers = window.__pickers || {};
	window.__pickers[pickerId] = picker;
}

// jQuery 版：初始化（或重新初始化）Location 的 Choices
function initLocationChoices() {
	const $select = $('#locationSelect');
	if (!$select.length) return;

	const prev = $select.data('choicesInstance');
	if (prev && typeof prev.destroy === 'function') {
		prev.destroy();
		$select.removeData('choicesInstance');
	}

	const instance = $select.data('choicesInstance') || new Choices($select.get(0), {
		searchEnabled: true,
		itemSelectText: '',
		shouldSort: true,
	});

	$select.data('choicesInstance', instance);

	$select.on('showDropdown', () => {
		const dd = instance.dropdown.element;
		const selected = dd.querySelector('.choices__item.is-selected');
		if (selected) selected.scrollIntoView({ block: 'nearest' });
	});
}

function updateLocationSelect(locationValue) {
	const $select = $('#locationSelect');
	if (!$select.length) return;

	$select.val(locationValue);

	const instance = $select.data('choicesInstance');
	if (instance) {
		instance.setChoiceByValue(locationValue);
	}
}

// ★ 新增：刷新 Timeline（向後端拉取專案事件）
function refreshTimeline(projectId) {
	$.getJSON(`api/project_events.php?project_id=${projectId}`)
		.done(function (resp) {
			const html = renderTimelineTab(resp.items || [], projectId);
			$('#tab-timeline').replaceWith(html);
		})
		.fail(function (xhr) {
			console.error('Load timeline failed:', xhr.responseText || xhr.statusText);
		});
}

// 開啟右側 Event Editor（若已存在就取代），並帶入資料
function showEventEditor(projectId, eventData = null) {
  const html = renderEventForm({ id: projectId }, eventData);
  const $panel = $('#modalEventForm');
  if ($panel.length) $panel.replaceWith(html);
  else $('#modalContent').append(html);
  // 打開滑出面板
  $('#modalEventForm').removeClass('translate-x-full').addClass('translate-x-0');
}

// ★ 修改：綁定新增事件/儲存/刪除
function bindModalEvents() {
	// 1. 點擊專案 Trigger → 載入 & 顯示 Modal
	$('#scheduleTable')
		.off('click.project', '.project-trigger')
		.on('click.project', '.project-trigger', function () {
			const projectId = $(this).data('id');
			const projectName = $(this).data('name');
			loadAndRenderProject(projectId, projectName);
			$('#projectModal').removeClass('hidden');
		});

	// 2. Tab 切換
	$('#modalContent')
		.off('click.tab', '#timelineTabs button')
		.on('click.tab', '#timelineTabs button', function () {
			$('#timelineTabs button')
				.removeClass('text-stone-700 border-stone-500 font-semibold')
				.addClass('border-transparent');
			$('.tab-content').addClass('hidden');
			$(this)
				.addClass('text-stone-700 border-stone-500 font-semibold')
				.removeClass('border-transparent');
			$(`#tab-${$(this).data('tab')}`).removeClass('hidden');
		});

	// 3. Project 編輯面板顯示/隱藏
	$('#modalEditToggle')
		.off('click.editToggle')
		.on('click.editToggle', function () {
			const $panel = $('#modalEditForm');
			const isOpen = !$panel.hasClass('translate-x-full');
			if (isOpen) $panel.removeClass('translate-x-0').addClass('translate-x-full');
			else $panel.removeClass('translate-x-full').addClass('translate-x-0');
		});

	// Project → Save
	$('#modalEditForm')
		.off('click.save', '#btnSaveProject')
		.on('click.save', '#btnSaveProject', function () {
			const $btn = $(this);
			const payload = {
				id: $('#inputProjectId').val(),
				name: $('#inputName').val(),
				dri: $('#inputDRI').val(),
				location: $('#locationSelect').val(),
				sku: $('#inputSKU').val(),
				category: $('#inputCategory').val(),
				stage: $('#inputStage').val(),
				status: $('#inputStatus').val(),
				start: $('#inputStart').val() || '',
				end: $('#inputEnd').val() || ''
			};
			if (!payload.name) { alert('Project Name is required'); return; }
			$btn.prop('disabled', true).text('Saving...');
			$.ajax({ url: 'api/update_project.php', type: 'POST', dataType: 'json', data: payload })
				.done(function (resp) {
					if (resp && resp.success) {
						$('#modalEditForm').addClass('translate-x-full').removeClass('translate-x-0');
						loadAndRenderProject(payload.id, payload.name);
						updateGlobalProject(payload.id, payload.name, payload.start, payload.end);
					} else {
						alert(resp?.message || 'Update failed.');
					}
				})
				.fail(function (xhr) {
					console.error('Update error:', xhr.responseText || xhr.statusText);
					alert('Server error. Please try again.');
				})
				.always(function () { $btn.prop('disabled', false).text('Save'); });
		});

	// Project 編輯面板關閉
	$('#editPanelClose')
		.off('click.editClose')
		.on('click.editClose', function () {
			$('#modalEditForm').addClass('translate-x-full').removeClass('translate-x-0');
		});

	// ★ 4-0) 點擊 Timeline 卡片 → 開啟編輯（排除點到刪除鈕的情況）
	$('#modalContent')
	  .off('click.timelineEdit', '.timeline-card')
	  .on('click.timelineEdit', '.timeline-card', function (e) {
	    if ($(e.target).closest('.btn-timeline-delete').length) return; // 避免刪除鈕冒泡
	    const $card = $(this);
	    const project_id = $('#tab-timeline').data('project-id');

	    const eventData = {
	      id: $card.data('eventId'),
	      title: $card.data('title'),
	      date: $card.data('date'),                 // YYYY/MM/DD
	      time_start: $card.data('timeStart') || '',
	      time_end: $card.data('timeEnd') || '',
	      linked_task: $card.data('linkedTask') || '',
	      status: $card.data('status') || 'Planned',
	      note: $card.data('note') || ''
	    };

	    showEventEditor(project_id, eventData);
	  });

	// ★ 4-1) 開啟 Event Editor（Add Event）
	$('#modalContent')
		.off('click.addEvent', '.btn-add-event')
		.on('click.addEvent', '.btn-add-event', function () {
			const pid = $('#tab-timeline').data('project-id');
			if (!pid) { alert('Missing project id.'); return; }
			// $('#modalEventForm').removeClass('translate-x-full').addClass('translate-x-0');
			showEventEditor(pid, null); // 空白表單（新增）
		});

	// ★ 4-2) 關閉 Event Editor
	$('#modalContent')
		.off('click.eventClose', '#eventPanelClose')
		.on('click.eventClose', '#eventPanelClose', function () {
			$('#modalEventForm').addClass('translate-x-full').removeClass('translate-x-0');
		});

	// ★ 4-3) 儲存事件
	$('#modalContent')
		.off('click.saveEvent', '#btnSaveEvent')
		.on('click.saveEvent', '#btnSaveEvent', function () {
			const $btn = $(this);
			const payload = {
				project_id: $('#eventProjectId').val(),
				event_id: $('#eventId').val(),
				title: $('#eventTitle').val().trim(),
				date: $('#eventDate').val().trim(),
				time_start: $('#eventTimeStart').val().trim(),
				time_end: $('#eventTimeEnd').val().trim(),
				linked_task: $('#eventLinkedTask').val().trim(),
				status: $('#eventStatus').val(),
				note: $('#eventNote').val().trim(),
			};

			if (!payload.title) { alert('Title is required'); return; }
			if (!payload.date) { alert('Date is required'); return; }

			console.log(payload);

			$btn.prop('disabled', true).text('Saving...');
			$.ajax({ url: 'api/event_upsert.php', type: 'POST', dataType: 'json', data: payload })
				.done(function (resp) {
					if (resp && resp.success) {
						$('#modalEventForm').addClass('translate-x-full').removeClass('translate-x-0');
						refreshTimeline(payload.project_id);
					} else {
						alert(resp?.message || 'Save failed.');
					}
				})
				.fail(function (xhr) {
					console.error('Event save error:', xhr.responseText || xhr.statusText);
					alert('Server error. Please try again.');
				})
				.always(function () { $btn.prop('disabled', false).text('Save'); });
		});

	// ★ 4-4) 直接在 Timeline 卡片上刪除
	$('#modalContent')
	  .off('click.timelineDel', '.btn-timeline-delete')
	  .on('click.timelineDel', '.btn-timeline-delete', function (e) {
	    e.preventDefault();
	    e.stopPropagation(); // 避免觸發其他點擊行為

	    const event_id = $(this).data('id');
	    const project_id = $('#tab-timeline').data('project-id');
	    if (!event_id || !project_id) return;

	    if (!confirm('Delete this event?')) return;

	    $.ajax({
	      url: 'api/event_delete.php',
	      type: 'POST',
	      dataType: 'json',
	      data: { project_id, event_id }
	    })
	    .done(function (resp) {
	      if (resp && resp.success) {
	        refreshTimeline(project_id); // 重新載入 Timeline
	      } else {
	        alert(resp?.message || 'Delete failed.');
	      }
	    })
	    .fail(function (xhr) {
	      console.error('Event delete error:', xhr.responseText || xhr.statusText);
	      alert('Server error. Please try again.');
	    });
	  });
}

/**
 * 正規化日期 'YYYY/MM/DD' 或 'YYYY-MM-DD' → 'YYYY-MM-DD'
 */
function normalizeDateString(s) {
	if (!s) return null;
	const t = String(s).trim().replace(/\//g, '-');
	const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!m) return null;
	const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
	if (Number.isNaN(d.getTime())) return null;
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${d.getFullYear()}-${mm}-${dd}`;
}

function getDominantColor(schedule = {}) {
	const counter = {};
	for (const v of Object.values(schedule || {})) {
		if (!v) continue;
		counter[v] = (counter[v] || 0) + 1;
	}
	let best = null, max = -1;
	for (const [color, cnt] of Object.entries(counter)) {
		if (cnt > max) { max = cnt; best = color; }
	}
	return best || 'green';
}

function buildSchedule(beginDate, endDate, color) {
	const out = {};
	const b = new Date(`${beginDate}T00:00:00`);
	const e = new Date(`${endDate}T00:00:00`);
	for (let d = new Date(b); d <= e; d.setDate(d.getDate() + 1)) {
		const yyyy = d.getFullYear();
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const dd = String(d.getDate()).padStart(2, '0');
		out[`${yyyy}-${mm}-${dd}`] = color;
	}
	return out;
}

function updateGlobalProject(id, newName, begin_date, end_date) {
	const idx = GLOBAL_PROJECTS.findIndex(p => String(p.id) === String(id));
	if (idx === -1) {
		console.warn(`updateGlobalProject: 找不到 id=${id} 的專案`);
		return null;
	}

	const baseColor = getDominantColor(GLOBAL_PROJECTS[idx].schedule);

	let b = normalizeDateString(begin_date);
	let e = normalizeDateString(end_date);
	if (!b || !e) {
		console.warn('updateGlobalProject: 日期格式不正確，需為 YYYY-MM-DD 或 YYYY/MM/DD', { begin_date, end_date });
		return null;
	}
	if (b > e) { const tmp = b; b = e; e = tmp; }

	const newSchedule = buildSchedule(b, e, baseColor);

	GLOBAL_PROJECTS[idx] = { ...GLOBAL_PROJECTS[idx], name: newName, schedule: newSchedule };

	renderScheduleTable(GLOBAL_PROJECTS, 'scheduleTable');
	return GLOBAL_PROJECTS[idx];
}

$(document).ready(function() {
	$.ajax({
		url: 'api/get_projects.php',
		type: 'GET',
		dataType: 'json',
		success: function(projectsData) {
			GLOBAL_PROJECTS = projectsData;
			if (typeof renderScheduleTable === 'function') {
				renderScheduleTable(projectsData, 'scheduleTable');
			} else {
				console.error('renderScheduleTable 函數未定義。');
			}
		},
		error: function(xhr, status, error) {
			console.error('呼叫 get_projects.php 失敗:', status, error);
			console.error('響應文本:', xhr.responseText);
		}
	});

	bindModalEvents();

	$('#modalClose').on('click', function () { $('#projectModal').addClass('hidden'); });

	$(document).on('keydown', function (e) {
		if (e.key === 'Escape') {
			$('#projectModal').addClass('hidden');
			$('#modalEventForm').addClass('translate-x-full');
			$('#modalEditForm').addClass('translate-x-full');
		}
	});

	let isMaximized = false;
	$('#modalMaximize').on('click', function () {
		const $box = $('#modalBox');
		if (isMaximized) {
			$box.css({ width: '', height: '', top: '', left: '', margin: 'auto' });
			$box.removeClass('maximized');
		} else {
			$box.css({ width: '100vw', height: '90vh', top: '5vh', left: '2vw', position: 'fixed', margin: 0 });
			$box.addClass('maximized');
		}
		isMaximized = !isMaximized;
		$('#modalHeader').toggleClass('cursor-move', !isMaximized);
	});

	let isDragging = false;
	let offset = { x: 0, y: 0 };

	$('#modalHeader').on('mousedown', function (e) {
		if ($('#modalBox').hasClass('maximized')) return;
		isDragging = true;
		const box = $('#modalBox')[0].getBoundingClientRect();
		offset = { x: e.clientX - box.left, y: e.clientY - box.top };
		e.preventDefault();
	});

	$(document).on('mousemove', function (e) {
		if (isDragging) {
			$('#modalBox').css({ position: 'fixed', left: e.clientX - offset.x, top: e.clientY - offset.y, margin: 0 });
		}
	});

	$(document).on('mouseup', function () { isDragging = false; });
});

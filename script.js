// --- DATA STRUCTURES (Simulating Database) ---

let MOCK_TASKS = [
    { id: 1, title: "Design Landing Page Mockup", assignedTo: "member", status: "complete", userId: 4, projectId: 1, contribution: 100 }, 
    { id: 2, title: "Develop Leaderboard Algorithm", assignedTo: "manager", status: "inprogress", userId: 2, projectId: 2, contribution: 80 }, 
    { id: 3, title: "Write Capstone Chapter 2 (RRL)", assignedTo: "member", status: "pending", userId: 4, projectId: 1, contribution: 40 }, 
    { id: 4, title: "Setup Laravel Development Environment", assignedTo: "manager", status: "complete", userId: 5, projectId: 3, contribution: 100 },
    { id: 5, title: "Prototype UI/UX Wireframes", assignedTo: "member", status: "inprogress", userId: 3, projectId: 1, contribution: 70 }
];

// Added user roles and login credentials
let MOCK_LEADERBOARD = [
    { name: "Charles V.", score: 980, rank: 3, id: 1, completedTasks: 0, username: "charles", password: "password", role: "member" },
    { name: "Jay-em R.", score: 1100, rank: 2, id: 2, completedTasks: 1, username: "manager", password: "password", role: "manager" }, // Manager Login (ID: 2)
    { name: "Rcjie V.", score: 750, rank: 4, id: 3, completedTasks: 0, username: "rcjie", password: "password", role: "member" },
    { name: "John Clarence", score: 1250, rank: 1, id: 4, completedTasks: 1, username: "member", password: "password", role: "member" }, // Member Login (ID: 4)
    { name: "Johannes T.", score: 620, rank: 5, id: 5, completedTasks: 1, username: "johannes", password: "password", role: "member" },
];

const MOCK_PROJECTS = [
    { id: 1, name: "WeLancer Capstone System", status: "In Progress", deadline: "2025-05-15", team: "Team Hercules" },
    { id: 2, name: "Marketing Campaign Q4", status: "Pending", deadline: "2025-11-30", team: "Marketing Group" },
    { id: 3, name: "Website Re-design 2026", status: "Complete", deadline: "2024-12-01", team: "Web Dev" },
    { id: 4, name: "HR Policy Documentation", status: "In Progress", deadline: "2025-02-28", team: "HR Team" }
];

let currentUserRole = '';
let currentUserId = 0;
let currentPage = 'dashboard';

// --- UTILITY FUNCTIONS ---

function getStatusBadge(status) {
    const statusMap = {
        'pending': { text: 'Pending', class: 'status-pending' },
        'inprogress': { text: 'In Progress', class: 'status-inprogress' },
        'complete': { text: 'Complete', class: 'status-complete' }
    };
    const badge = statusMap[status] || { text: 'Unknown', class: 'status-pending' };
    return `<span class="status-badge ${badge.class}">${badge.text}</span>`;
}

function getUserNameById(id) {
    return MOCK_LEADERBOARD.find(u => u.id === id)?.name || 'N/A';
}

// --- MODAL / OVERLAY IMPLEMENTATION ---

function openModal(title, content) {
    const modal = document.getElementById('prototype-modal');
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-content').innerHTML = content;
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('prototype-modal').style.display = 'none';
}

// --- FEATURE IMPLEMENTATION FUNCTIONS ---

function viewTaskDetails(taskId) {
    const task = MOCK_TASKS.find(t => t.id === taskId);
    if (!task) return;

    const assignedUser = getUserNameById(task.userId);
    const projectName = MOCK_PROJECTS.find(p => p.id === task.projectId)?.name || 'N/A';
    
    const roleHintText = currentUserRole === 'manager' 
        ? "This provides the Manager with the necessary level of **Transparency** over team activities."
        : "This view is for transparency on your own tasks.";

    const content = `
        <p><strong>Task Title:</strong> ${task.title}</p>
        <p><strong>Status:</strong> ${getStatusBadge(task.status)}</p>
        <p><strong>Assigned To:</strong> ${assignedUser}</p>
        <p><strong>Project:</strong> ${projectName}</p>
        <p><strong>Contribution Quality:</strong> ${task.contribution}%</p>
        <p class="role-hint">${roleHintText}</p>
    `;
    openModal(`Task Details: ${task.id}`, content);
}

function completeTask(taskId) {
    const task = MOCK_TASKS.find(t => t.id === taskId);
    
    if (task && task.status !== 'complete' && task.userId === currentUserId) {
        task.status = 'complete';
        task.contribution = 100;
        
        const user = MOCK_LEADERBOARD.find(u => u.id === currentUserId);
        if (user) {
            user.score += 50; 
            user.completedTasks += 1;
        }
        
        loadDashboard(currentPage);
        
        openModal('Task Completed! 🏅', `<p>Task <strong>"${task.title}"</strong> is marked complete. Your score increased by 50 points, boosting your rank on the Live Leaderboard!</p>`);

    } else if (task && task.status === 'complete') {
        openModal('Task Status', `<p>Task <strong>"${task.title}"</strong> is already complete. Great work!</p>`);
    }
}

function assignNewTask() {
    if (currentUserRole !== 'manager') {
        openModal('Access Denied', '<p>Only Managers can assign new tasks.</p>');
        return;
    }
    
    const taskTitle = prompt("Enter the new task title (e.g., 'Develop API Endpoints'):");
    if (!taskTitle) return;

    const newTaskId = MOCK_TASKS.length + 1;
    const newTask = {
        id: newTaskId,
        title: taskTitle,
        assignedTo: "member",
        status: "pending",
        userId: 4, // Defaulting to John Clarence (member)
        projectId: 1,
        contribution: 0 
    };

    MOCK_TASKS.push(newTask);
    
    openModal('Task Assignment Success 🎉', `<p>New task <strong>"${taskTitle}"</strong> has been successfully assigned to John Clarence. Check the Task List!</p>`);
    
    loadDashboard(currentPage);
}

function startNewProject() {
    if (currentUserRole !== 'manager') {
        openModal('Access Denied', '<p>Only Managers can initiate new projects.</p>');
        return;
    }
    
    const content = `
        <form onsubmit="event.preventDefault(); submitNewProject(this);">
            <div class="input-group"><label>Project Name</label><input type="text" id="proj-name" required value="New Internal System 2026"></div>
            <div class="input-group"><label>Team</label><input type="text" id="proj-team" required value="New Dev Team"></div>
            <div class="input-group"><label>Deadline</label><input type="date" id="proj-deadline" required value="2026-01-01"></div>
            <button class="btn-primary" type="submit" style="width:auto;">Submit Project Proposal</button>
        </form>
    `;
    openModal('Initiate New Project Proposal', content);
}

function submitNewProject(form) {
    const newId = MOCK_PROJECTS.length + 1;
    MOCK_PROJECTS.push({
        id: newId,
        name: form.elements['proj-name'].value,
        status: "Pending",
        deadline: form.elements['proj-deadline'].value,
        team: form.elements['proj-team'].value
    });
    closeModal();
    loadDashboard('projects');
    openModal('Success! 🚀', `<p>Project Proposal for <strong>"${form.elements['proj-name'].value}"</strong> has been submitted and is now listed under Pending. This demonstrates the **Workflow** initiation process.</p>`);
}

function showReportStatus() {
    document.getElementById('report-status-card').style.display = 'block';
    
    const btn = document.getElementById('generate-report-btn');
    btn.disabled = true;
    btn.innerText = '✅ Report Generated';

    // Auto-reset after 5 seconds
    setTimeout(() => {
        btn.disabled = false;
        btn.innerText = '📊 Generate Report';
        document.getElementById('report-status-card').style.display = 'none';
    }, 5000); 
}

function showHRContent(type) {
    const titleEl = document.getElementById('hr-content-title');
    const contentEl = document.getElementById('hr-content-area');
    
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

    let content = '';
    let title = '';
    
    if (type === 'resource') {
        title = 'Resource Allocation Module (Live View)';
        content = `<p><strong>Recommendation:</strong> System suggests allocating John Clarence (high KPI score) to the Marketing Campaign. This screen allows the Manager to optimize **Resource Allocation** based on performance data.</p><p><button class="btn-primary" style="width:auto; background-color: var(--success);" onclick="openModal('Action', 'Resource updated successfully!')">Commit Allocation</button></p>`;
    } else if (type === 'conflicts') {
        title = 'Conflict Resolution Dashboard';
        content = `<p style="color:var(--error); font-weight:bold;">Open Conflict Case #001: Delay in task handoff between Charles V. and Johannes T.</p><p>Review logs and implement solution: The system facilitates **Accountability** and conflict management through logged user interactions.</p>`;
    } else if (type === 'training') {
        title = 'Workforce Planning & Training';
        content = `<p><strong>Training Proposal:</strong> New Laravel framework course required for Jay-em R. and Rcjie V. to improve their technical skill set. This aligns with the system's goal of **Continuous Improvement**.</p>`;
    }

    titleEl.innerText = title;
    contentEl.innerHTML = content;
    document.getElementById(`tab-${type}`).classList.add('active');
}

function reviewUserPerformance(userId) {
    const user = MOCK_LEADERBOARD.find(u => u.id === userId);
    if (!user) return;
    
    const userTasks = MOCK_TASKS.filter(t => t.userId === userId);
    const completed = user.completedTasks;
    const total = userTasks.length;
    
    const content = `
        <div class="input-group">
            <p><strong>Reviewing:</strong> ${user.name}</p>
            <p><strong>Score:</strong> ${user.score} pts</p>
            <p><strong>Tasks Completed:</strong> ${completed} out of ${total}</p>
            <p style="margin-top: 15px;">**Manager Notes on Contribution Quality:**</p>
            <textarea style="width: 100%; min-height: 80px; padding: 10px; border: 1px solid #ccc;">e.g., Excellent attention to detail on Project 3. Needs improvement on timely communication.</textarea>
        </div>
        
        <p class="role-hint" style="margin-top: 20px;">This demonstrates the Manager's ability to input qualitative data, enhancing the system's **Accountability** feature.</p>
        <button class="btn-primary" style="width:100%; margin-top: 20px;" onclick="closeModal(); openModal('Review Complete', 'Performance review notes for **${user.name}** saved successfully!')">Save Review & Submit</button>
    `;
    openModal(`Performance Review: ${user.name}`, content);
}

// --- ANALYTICS HELPERS ---

function getAdminMetricsHTML() {
    const totalTasksCompleted = MOCK_TASKS.filter(t => t.status === 'complete').length;
    const totalEmployees = MOCK_LEADERBOARD.length;
    const totalProjectsCompleted = MOCK_PROJECTS.filter(p => p.status.toLowerCase() === 'complete').length;
    const totalPendingTasks = MOCK_TASKS.filter(t => t.status === 'pending').length;

    return `
        <div class="metrics-grid">
            <div class="metric-box">
                <h4>Completed Tasks</h4>
                <p class="metric-value">${totalTasksCompleted}</p>
            </div>
            <div class="metric-box">
                <h4>Total Employees</h4>
                <p class="metric-value">${totalEmployees}</p>
            </div>
            <div class="metric-box">
                <h4>Projects Finished</h4>
                <p class="metric-value">${totalProjectsCompleted}</p>
            </div>
            <div class="metric-box">
                <h4>Pending Tasks</h4>
                <p class="metric-value">${totalPendingTasks}</p>
            </div>
        </div>
    `;
}

function getLeaderboardChartHTML() {
    const sortedLeaderboard = [...MOCK_LEADERBOARD].sort((a, b) => b.score - a.score);
    const maxScore = sortedLeaderboard[0]?.score || 1;
    let chartBars = '';

    sortedLeaderboard.forEach(user => {
        const percent = ((user.score / maxScore) * 100).toFixed(0);
        chartBars += `
            <div class="chart-bar-container">
                <span class="chart-label">${user.name}</span>
                <div class="chart-bar" style="width: ${percent}%;">
                    ${user.score} pts
                </div>
            </div>
        `;
    });

    return `
        <div class="card full-width">
            <h3>Live Leaderboard Score Visualization</h3>
            <p class="role-hint">This visualization highlights top performers based on accumulated KPI scores.</p>
            <div class="chart-container">
                ${chartBars}
            </div>
        </div>
    `;
}

// --- PAGE CONTENT RENDERING FUNCTIONS ---

function renderTasksCard() {
    let tasksHTML = '';
    const isManager = currentUserRole === 'manager';
    
    let tasksToShow = isManager 
        ? MOCK_TASKS 
        : MOCK_TASKS.filter(task => task.userId === currentUserId); 

    if (tasksToShow.length === 0) {
        tasksHTML = '<p>No tasks assigned.</p>';
    } else {
        tasksToShow.forEach(task => {
            let actionButton = '';
            if (isManager) {
                actionButton = `<button class="btn-task-action" onclick="viewTaskDetails(${task.id})">View Details</button>`;
            } else if (task.userId === currentUserId && task.status !== 'complete') {
                actionButton = `<button class="btn-task-action btn-complete" onclick="completeTask(${task.id})">Mark Complete</button>`;
            }

            tasksHTML += `
                <li>
                    <div>
                        <span>${task.title}</span><br>
                        <small>Project: ${MOCK_PROJECTS.find(p => p.id === task.projectId)?.name || 'N/A'}</small>
                    </div>
                    <div>
                        ${getStatusBadge(task.status)}
                        ${actionButton}
                    </div>
                </li>
            `;
        });
        tasksHTML = `<ul>${tasksHTML}</ul>`;
    }

    const headerText = isManager ? 'All Team Tasks' : 'My Assigned Tasks';
    
    return `
        <div class="card" id="task-list">
            <h3 id="tasks-header">${headerText}</h3>
            ${isManager ? '<button class="btn-primary" onclick="assignNewTask()">➕ Assign New Task</button>' : ''}
            ${tasksHTML}
        </div>
    `;
}

function renderLeaderboardCard() {
    let leaderboardRows = '';

    const sortedLeaderboard = [...MOCK_LEADERBOARD].sort((a, b) => b.score - a.score);
    sortedLeaderboard.forEach((user, index) => {
        user.rank = index + 1; 

        leaderboardRows += `
            <tr class="${user.id === currentUserId ? 'highlight-user' : ''}">
                <td>#${user.rank}</td>
                <td>${user.name}</td>
                <td>${user.score} pts</td>
            </tr>
        `;
    });

    return `
        <div class="card" id="leaderboard">
            <h3>Live Performance Leaderboard 🏆</h3>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Name</th>
                        <th>Score (KPIs)</th>
                    </tr>
                </thead>
                <tbody>
                    ${leaderboardRows}
                </tbody>
            </table>
        </div>
    `;
}

function renderProjectsPage() {
    let projectRows = '';
    MOCK_PROJECTS.forEach(project => {
        projectRows += `
            <tr>
                <td>${project.id}</td>
                <td><strong>${project.name}</strong></td>
                <td>${project.team}</td>
                <td>${project.deadline}</td>
                <td>${getStatusBadge(project.status.toLowerCase().replace(' ', ''))}</td>
                <td><button class="btn-task-action" onclick="viewTaskDetails(MOCK_TASKS.find(t=>t.projectId===${project.id})?.id)">Dashboard</button></td>
            </tr>
        `;
    });

    return `
        <div class="page-header">
            <h2>Project Management Portal</h2>
            ${currentUserRole === 'manager' ? '<button class="btn-primary" onclick="startNewProject()">⭐ Start New Project</button>' : ''}
        </div>
        <div class="card full-width">
            <h3>Active and Completed Projects</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Team</th>
                        <th>Deadline</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>${projectRows}</tbody>
            </table>
        </div>
        <p class="role-hint">${currentUserRole === 'manager' ? 'Managers can initiate new projects and view all team reports.' : 'Members can only view project status.'}</p>
    `;
}

function renderPerformancePage() {
    const isManager = currentUserRole === 'manager';
    let performanceRows = '';
    
    const sortedLeaderboard = [...MOCK_LEADERBOARD].sort((a, b) => b.completedTasks - a.completedTasks);

    sortedLeaderboard.forEach(user => {
        const userTasks = MOCK_TASKS.filter(t => t.userId === user.id);
        const totalTasks = userTasks.length;
        const completedTasks = user.completedTasks;
        const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0;
        const avgContribution = userTasks.reduce((sum, t) => sum + t.contribution, 0) / (totalTasks || 1);

        performanceRows += `
            <tr class="${user.id === currentUserId ? 'highlight-user' : ''}">
                <td>#${user.rank}</td>
                <td>${user.name}</td>
                <td>${user.score} pts</td>
                <td>${completedTasks} / ${totalTasks}</td>
                <td>${completionRate}%</td>
                <td>${avgContribution.toFixed(0)}%</td>
                ${isManager ? `<td><button class="btn-task-action" onclick="reviewUserPerformance(${user.id})">Review</button></td>` : ''}
            </tr>
        `;
    });

    return `
        <div class="page-header">
            <h2>Key Performance Indicators (KPI) Report</h2>
            ${isManager ? '<button class="btn-primary" id="generate-report-btn" onclick="showReportStatus()">📊 Generate Report</button>' : ''}
        </div>
        
        <div class="card full-width" id="report-status-card" style="display:none; margin-bottom: 20px;">
            <p style="color: var(--success); font-weight: bold; margin: 0;">✅ Report generated successfully on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.</p>
        </div>

        <div class="card full-width">
            <h3>Detailed Performance Metrics</h3>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Name</th>
                        <th>Score (KPIs)</th>
                        <th>Completed Tasks</th>
                        <th>Completion Rate</th>
                        <th>Avg. Contribution Quality</th>
                        ${isManager ? '<th>Action</th>' : ''}
                    </tr>
                </thead>
                <tbody>${performanceRows}</tbody>
            </table>
        </div>
        <p class="role-hint">This page uses measurable KPIs like Task Completion and Contribution Quality to drive continuous improvement.</p>
    `;
}

function renderHRAdminPage() {
    if (currentUserRole !== 'manager') {
        return `<div class="card full-width error-card"><h3>🚫 Access Denied</h3><p>This page is restricted to HR/Admin roles (Managers) to manage resource allocation and conflicts.</p></div>`;
    }

    const initialContent = `<p><strong>Training Proposal:</strong> New Laravel framework course required for Jay-em R. and Rcjie V. to improve their technical skill set. This aligns with the system's goal of **Continuous Improvement**.</p>`;

    return `
        <div class="page-header">
            <h2>HR & Administrator Portal</h2>
            <p class="role-hint">This portal is restricted to Managers for specialized functions like Resource Allocation and Conflict Resolution.</p>
        </div>
        
        <div class="card full-width">
            <h3>HR Metrics & Quick Links</h3>
            <ul>
                <li><strong>Total Staff:</strong> ${MOCK_LEADERBOARD.length}</li>
                <li><strong>Active Projects:</strong> ${MOCK_PROJECTS.filter(p => p.status === 'In Progress').length}</li>
                <li style="color:var(--error);"><strong>Conflict Cases:</strong> 2 Open Cases</li>
            </ul>
        </div>

        <div class="card full-width" id="hr-module-card">
            <div class="tab-buttons">
                <button class="tab-button" id="tab-resource" onclick="showHRContent('resource')">🛠️ Resource Allocation</button>
                <button class="tab-button" id="tab-conflicts" onclick="showHRContent('conflicts')">⚠️ Conflict Resolution</button>
                <button class="tab-button active" id="tab-training" onclick="showHRContent('training')">🧑‍💻 Training Management</button>
            </div>
            
            <h3 id="hr-content-title">Workforce Planning & Training</h3>
            <div id="hr-content-area" style="padding: 10px 0;">
                ${initialContent}
            </div>
        </div>
    `;
}

function renderAdminAnalyticsPage() {
    if (currentUserRole !== 'manager') {
        return `<div class="card full-width error-card"><h3>🚫 Access Denied</h3><p>This page is restricted to HR/Admin roles (Managers).</p></div>`;
    }

    const metricsHTML = getAdminMetricsHTML();
    const chartHTML = getLeaderboardChartHTML();

    return `
        <div class="page-header">
            <h2>System Analytics & KPI Dashboard</h2>
            <button class="btn-primary" onclick="openModal('Data Download', 'Simulating download of full system data report...')" style="width:auto;">⬇️ Download Report Data</button>
        </div>
        
        <div class="card full-width">
            <h3>Key System Metrics</h3>
            ${metricsHTML}
        </div>

        ${chartHTML}
    `;
}


function renderProfilePage() {
    const user = MOCK_LEADERBOARD.find(u => u.id === currentUserId);
    if (!user) {
        return `<div class="card full-width error-card"><h3>User Data Not Found</h3><p>Please log in again.</p></div>`;
    }

    const tasks = MOCK_TASKS.filter(t => t.userId === currentUserId);
    const completedTasks = tasks.filter(t => t.status === 'complete').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0;

    let taskListHTML = '<ul>';
    tasks.slice(0, 3).forEach(task => { 
        taskListHTML += `<li>${task.title} - ${getStatusBadge(task.status)}</li>`;
    });
    if (totalTasks > 3) {
        taskListHTML += `<li>... and ${totalTasks - 3} more.</li>`;
    }
    taskListHTML += '</ul>';

    return `
        <div class="page-header">
            <h2>My Profile & Account Settings</h2>
            <button class="btn-primary" onclick="openModal('Change Password', 'Simulating security change...')">🔐 Change Password</button>
        </div>
        
        <div class="profile-container">
            <div class="card profile-picture-card">
                <img src="https://via.placeholder.com/150?text=${user.name.charAt(0)}" alt="Profile Picture" class="profile-picture">
                <button class="btn-task-action" onclick="openModal('Upload Photo', 'Simulating photo upload interface...')">Upload Photo</button>
            </div>

            <div class="card profile-card">
                <h3>Account Details</h3>
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Role:</strong> ${currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)}</p>
                <p><strong>Employee ID:</strong> EMP-${currentUserId.toString().padStart(3, '0')}</p>
            </div>
            
            <div class="card profile-card">
                <h3>Performance Summary</h3>
                <p><strong>Current KPI Score:</strong> <span class="metric-value">${user.score}</span> pts</p>
                <p><strong>Leaderboard Rank:</strong> #${user.rank}</p>
                <p><strong>Task Completion Rate:</strong> ${completionRate}%</p>
            </div>
        </div>

        <div class="card full-width">
            <h3>Recent Activity</h3>
            ${taskListHTML}
            <p class="role-hint" style="margin-top: 20px;">This page promotes **Transparency** for the member, showing them exactly where they stand in the system.</p>
        </div>
    `;
}

function renderDashboardPage() {
    return `
        <section id="dashboard-content">
            <div>
                ${renderTasksCard()}
            </div>
            
            <div>
                ${renderLeaderboardCard()}
                ${currentUserRole === 'manager' ? renderManagerOnlyContent() : renderMemberOnlyContent()}
            </div>
        </section>
    `;
}

function renderManagerOnlyContent() {
    return `
        <div class="card manager-only" id="team-reports">
            <h3>Team Reports (Manager View)</h3>
            <p>Total Active Projects: <strong>${MOCK_PROJECTS.filter(p => p.status === 'In Progress').length}</strong> | Overdue Tasks: <span style="color:var(--error); font-weight:bold;">${MOCK_TASKS.filter(t => t.status === 'pending').length}</span></p>
            <p>This is where Managers track team-wide KPIs, reflecting the **accountability** objective of WeLancer.</p>
        </div>
    `;
}

// *** CRITICAL FIX APPLIED HERE ***
function renderMemberOnlyContent() {
    const user = MOCK_LEADERBOARD.find(u => u.id === currentUserId);
    
    // Safety check: if user data is missing, display a controlled error message.
    if (!user) {
        return `<div class="card member-only" id="member-performance"><h3>My Performance Summary</h3><p class="error-card">⚠️ Error: Could not load user data. Try logging out and back in.</p></div>`;
    }
    
    const totalTasks = MOCK_TASKS.filter(t => t.userId === currentUserId).length;
    const completionRate = totalTasks > 0 ? ((user.completedTasks / totalTasks) * 100) : 0;

    return `
        <div class="card member-only" id="member-performance">
            <h3>My Performance Summary</h3>
            <p>Current Rank: <strong>#${user.rank}</strong></p>
            <p>Completion Rate: <strong>${completionRate.toFixed(0)}%</strong></p>
            <p>This simplified view motivates the **Team Member**, reflecting the **gamification** objective.</p>
        </div>
    `;
}
// **********************************

// --- MAIN RENDERING & ROUTING ---

function getPageContent(pageName) {
    switch(pageName) {
        case 'profile':
            return renderProfilePage(); 
        case 'projects':
            return renderProjectsPage();
        case 'performance':
            return renderPerformancePage();
        case 'hr_admin':
            return renderHRAdminPage();
        case 'admin_analytics':
            return renderAdminAnalyticsPage();
        case 'dashboard':
        default:
            return renderDashboardPage();
    }
}

function getSidebarHTML() {
    const sidebarItems = [
        { name: 'Dashboard', id: 'dashboard', icon: '🏠' },
        { name: 'Profile', id: 'profile', icon: '👤' }, 
        { name: 'Projects', id: 'projects', icon: '📂' },
        { name: 'Performance', id: 'performance', icon: '📈' },
        { name: 'HR/Admin', id: 'hr_admin', icon: '⚙️', managerOnly: true },
        { name: 'Analytics', id: 'admin_analytics', icon: '📊', managerOnly: true }
    ];

    let navLinks = '';
    sidebarItems.forEach(item => {
        if (item.managerOnly && currentUserRole !== 'manager') {
            return; 
        }
        const activeClass = item.id === currentPage ? 'active' : '';
        navLinks += `<a href="#" class="${activeClass}" onclick="renderPage('${item.id}')">${item.icon} ${item.name}</a>`;
    });

    return `
        <aside id="sidebar">
            <h2>WeLancer</h2>
            <nav>${navLinks}</nav>
        </aside>
    `;
}

function renderPage(pageName) {
    currentPage = pageName;
    loadDashboard(pageName);
}

function loadDashboard(pageName = 'dashboard') {
    localStorage.setItem('currentPage', pageName);

    // 1. Hide login container
    document.querySelector('.login-container').style.display = 'none';

    // 2. Hide the floating background
    const floatingBg = document.getElementById('floating-bg');
    if (floatingBg) {
        floatingBg.style.display = 'none';
    }
    
    const appRoot = document.getElementById('app-root');
    const userName = getUserNameById(currentUserId) || currentUserRole.toUpperCase();

    appRoot.innerHTML = `
        ${getSidebarHTML()}
        <main id="main-container">
            <header id="header">
                <h1>${currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('_', ' ')}</h1>
                <div>
                    <span style="margin-right: 15px;">Welcome, ${userName}!</span>
                    <button class="btn-primary logout-btn" onclick="logout()">Logout</button>
                </div>
            </header>
            <div id="main-page-content" class="page-wrapper">
                ${getPageContent(pageName)}
            </div>
        </main>
    `;

    // 3. Ensure app-root is visible and set body styling for app view
    appRoot.style.display = 'flex';
    document.body.style.justifyContent = 'flex-start';
    document.body.style.alignItems = 'stretch';
    
    // 4. Apply role-based visibility to content blocks
    updateUIVisibility(currentUserRole);
}

function updateUIVisibility(role) {
    const isManager = role === 'manager';
    
    document.querySelectorAll('.manager-only').forEach(el => {
        el.style.display = isManager ? 'block' : 'none';
    });

    document.querySelectorAll('.member-only').forEach(el => {
        el.style.display = !isManager ? 'block' : 'none';
    });
}

// --- PERSISTENCE & LOGIN LOGIC ---

function checkLoginStateOnLoad() {
    const role = localStorage.getItem('userRole');
    const id = localStorage.getItem('userId');
    const storedPage = localStorage.getItem('currentPage');
    const floatingBg = document.getElementById('floating-bg');


    if (role && id) {
        // State found: restore session
        currentUserRole = role;
        currentUserId = parseInt(id);
        currentPage = storedPage || 'dashboard'; 
        loadDashboard(currentPage);
    } else {
        // No state found: show login page 
        document.getElementById('app-root').style.display = 'none';
        
        // Ensure login container is visible and centered
        document.querySelector('.login-container').style.display = 'flex';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
        
        // Ensure the floating background is visible for the login screen
        if (floatingBg) {
            floatingBg.style.display = 'block'; 
        }
    }
}


function handleLogin(event) {
    event.preventDefault();
    const loginUsername = document.getElementById('username').value.toLowerCase();
    const loginPassword = document.getElementById('password').value; 

    const messageEl = document.getElementById('login-message');
    messageEl.style.display = 'none';

    // Find user in the MOCK_LEADERBOARD based on credentials
    const authenticatedUser = MOCK_LEADERBOARD.find(u => 
        u.username === loginUsername && u.password === loginPassword
    );

    if (authenticatedUser) {
        currentUserRole = authenticatedUser.role; 
        currentUserId = authenticatedUser.id;

        // Save state to localStorage upon successful login
        localStorage.setItem('userRole', currentUserRole);
        localStorage.setItem('userId', currentUserId.toString());

        loadDashboard();
    } else {
        messageEl.textContent = 'Invalid username or password. Try "manager" or "member".';
        messageEl.style.display = 'block';
    }
}


function logout() {
    // Clear state from localStorage
    localStorage.clear();
    
    // Explicitly show floating background before reloading
    const floatingBg = document.getElementById('floating-bg');
    if (floatingBg) {
        floatingBg.style.display = 'block';
    }

    currentUserRole = '';
    currentUserId = 0;
    currentPage = 'dashboard';
    window.location.reload(); 
}

document.addEventListener('DOMContentLoaded', () => {
    // Inject Modal HTML into the body, outside the main application structure
    document.body.insertAdjacentHTML('beforeend', `
        <div id="prototype-modal" onclick="closeModal()">
            <div id="modal-box" onclick="event.stopPropagation()">
                <h3 id="modal-title">Modal Title</h3>
                <div id="modal-content">Modal Content</div>
                <button class="btn-primary" onclick="closeModal()">Close</button>
            </div>
        </div>
    `);
    
    // Attach form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Check login state immediately when the page loads
    checkLoginStateOnLoad();
});
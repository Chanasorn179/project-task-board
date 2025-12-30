// ===== API CONFIG (Week 5 Client–Server) =====
const API_BASE = API_CONFIG.BASE_URL;

const API = {
  TASKS: `${API_BASE}${API_CONFIG.ENDPOINTS.TASKS}`,
  STATS: `${API_BASE}${API_CONFIG.ENDPOINTS.STATS}`,
};

// ===== STATUS & PRIORITY MAPPING =====
const STATUS_MAP = {
  todo: "To Do",
  doing: "In Progress",
  done: "Done",
};

const STATUS_MAP_REVERSE = {
  "To Do": "todo",
  "In Progress": "doing",
  Done: "done",
};

const PRIORITY_MAP = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const PRIORITY_MAP_REVERSE = {
  High: "high",
  Medium: "medium",
  Low: "low",
};

// ================= MOCK DATA =================
let mockTasks = [];
let allTasks = [];

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  document
    .getElementById("filterStatus")
    .addEventListener("change", renderTasks);
  setupDragAndDrop();
});

// ================= 1. ADD TASK =================
const taskForm = document.getElementById("taskForm");

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("taskTitle").value.trim();
  if (!title) {
    alert("กรุณากรอกชื่องาน");
    return;
  }

  const uiStatus = document.getElementById("taskStatus").value;
  const uiPriority = document.getElementById("taskPriority").value || "Medium";

  const backendStatus = STATUS_MAP_REVERSE[uiStatus];
  const backendPriority = PRIORITY_MAP_REVERSE[uiPriority];

  if (!backendStatus || !backendPriority) {
    alert("สถานะหรือระดับความสำคัญไม่ถูกต้อง");
    console.error("Mapping error:", { uiStatus, uiPriority });
    return;
  }

  const newTask = {
    title,
    description: document.getElementById("taskDesc").value,
    status: backendStatus, // todo | doing | done
    priority: backendPriority, // low | medium | high
  };

  console.log("SEND TO API:", newTask);

  try {
    const res = await fetch(API.TASKS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg);
    }

    taskForm.reset();
    loadTasks();
  } catch (err) {
    console.warn("API Error (Preview Mode):", err);
    newTask.id = Date.now();
    newTask.status = uiStatus;
    newTask.priority = uiPriority;
    mockTasks.push(newTask);
    allTasks = mockTasks;
    renderTasks();
  }
});

// ================= 2. LOAD TASKS =================
async function loadTasks() {
  try {
    const res = await fetch(API.TASKS);
    if (!res.ok) throw new Error("API error");
    const result = await res.json();

    allTasks = (result.data || []).map((t) => ({
      ...t,
      status: STATUS_MAP[t.status] || "To Do",
      priority: PRIORITY_MAP[t.priority] || "Medium",
    }));

    renderTasks();
  } catch (err) {
    console.warn("Using Mock Data:", err);
    allTasks = mockTasks;
    renderTasks();
  }
}

// ================= 3. RENDER BOARD =================
function renderTasks() {
  document.getElementById("count-todo").innerText = allTasks.filter(
    (t) => t.status === "To Do"
  ).length;
  document.getElementById("count-progress").innerText = allTasks.filter(
    (t) => t.status === "In Progress"
  ).length;
  document.getElementById("count-done").innerText = allTasks.filter(
    (t) => t.status === "Done"
  ).length;

  const filterValue = document.getElementById("filterStatus").value;

  const colTodo = document.getElementById("col-todo");
  const colInProgress = document.getElementById("col-inprogress");
  const colDone = document.getElementById("col-done");

  [colTodo, colInProgress, colDone].forEach((c) => (c.innerHTML = ""));

  const tasksToRender =
    filterValue === "All"
      ? allTasks
      : allTasks.filter((t) => t.status === filterValue);

  tasksToRender.forEach((task) => {
    const card = document.createElement("div");
    card.className = "task-card";
    card.setAttribute("draggable", "true");
    card.dataset.id = task.id;

    card.innerHTML = `
      <span class="task-badge">${task.status}</span>
      <h3>${task.title}</h3>
      <p>${task.description || "-"}</p>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <button class="btn-delete">Delete</button>
    `;

    card.querySelector(".btn-delete").onclick = () => deleteTask(task.id);
    card.addEventListener("dragstart", handleDragStart);

    if (task.status === "To Do") colTodo.appendChild(card);
    else if (task.status === "In Progress") colInProgress.appendChild(card);
    else colDone.appendChild(card);
  });
}

// ================= 4. DELETE =================
async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;

  try {
    const res = await fetch(`${API.TASKS}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("API error");
    loadTasks();
  } catch (err) {
    console.warn("API Error (Preview Mode):", err);
    mockTasks = mockTasks.filter((t) => t.id !== id);
    allTasks = mockTasks;
    renderTasks();
  }
}

// ================= 5. DRAG & DROP =================
let draggedId = null;

function handleDragStart(e) {
  draggedId = e.target.dataset.id;
}

function setupDragAndDrop() {
  document.querySelectorAll(".board-column-body").forEach((col) => {
    col.addEventListener("dragover", (e) => e.preventDefault());

    col.addEventListener("drop", async () => {
      if (!draggedId) return;
      const uiStatus = col.parentElement.dataset.status;
      await changeTaskStatus(Number(draggedId), uiStatus);
      draggedId = null;
    });
  });
}

// ================= 6. CHANGE STATUS =================
async function changeTaskStatus(id, uiStatus) {
  const backendStatus = STATUS_MAP_REVERSE[uiStatus];

  if (!backendStatus) {
    console.error("Invalid status from UI:", uiStatus);
    return;
  }

  try {
    const res = await fetch(`${API.TASKS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: backendStatus }),
    });

    if (!res.ok) throw new Error("API error");
    loadTasks();
  } catch (err) {
    console.warn("Fallback mode:", err);
    mockTasks = mockTasks.map((t) =>
      t.id === id ? { ...t, status: uiStatus } : t
    );
    allTasks = mockTasks;
    renderTasks();
  }
}

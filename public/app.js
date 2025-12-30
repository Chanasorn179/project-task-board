const API = "/api/tasks";

// Mock Data สำหรับ Preview
let mockTasks = [
  {
    id: 1,
    title: "Design UI",
    description: "Create Figma mockup for task board",
    status: "Done",
    priority: "High",
  },
  {
    id: 2,
    title: "Setup Database",
    description: "Install SQLite and create schema",
    status: "Done",
    priority: "Medium",
  },
  {
    id: 3,
    title: "Build API",
    description: "Implement GET and POST routes in Node.js",
    status: "In Progress",
    priority: "High",
  },
  {
    id: 4,
    title: "Frontend Logic",
    description: "Connect fetch API with UI",
    status: "To Do",
    priority: "Medium",
  },
  {
    id: 5,
    title: "Testing",
    description: "Test all CRUD operations",
    status: "To Do",
    priority: "Low",
  },
];

let allTasks = [];

document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  document
    .getElementById("filterStatus")
    .addEventListener("change", renderTasks);

  setupDragAndDrop();
});

// 1. Add Task
const taskForm = document.getElementById("taskForm");
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newTask = {
    title: document.getElementById("taskTitle").value,
    description: document.getElementById("taskDesc").value,
    status: document.getElementById("taskStatus").value,
    priority: document.getElementById("taskPriority").value || "Medium",
  };

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });

    if (!res.ok) throw new Error("API not found");

    e.target.reset();
    loadTasks();
  } catch (err) {
    console.warn("API Error (Preview Mode):", err);
    newTask.id = Date.now();
    mockTasks.push(newTask);
    allTasks = mockTasks;
    e.target.reset();
    renderTasks();
  }
});

// 2. Load Tasks
async function loadTasks() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("API not found");
    const data = await res.json();

    // เผื่อ backend ยังไม่ได้ส่ง priority มา ให้ default = Medium
    allTasks = (data.data || []).map((t) => ({
      ...t,
      priority: t.priority || "Medium",
    }));

    renderTasks();
  } catch (err) {
    console.warn("Using Mock Data:", err);
    allTasks = mockTasks;
    renderTasks();
  }
}

// 3. Render Board
function renderTasks() {
  // summary
  const countTodo = allTasks.filter((t) => t.status === "To Do").length;
  const countProgress = allTasks.filter(
    (t) => t.status === "In Progress"
  ).length;
  const countDone = allTasks.filter((t) => t.status === "Done").length;

  document.getElementById("count-todo").innerText = countTodo;
  document.getElementById("count-progress").innerText = countProgress;
  document.getElementById("count-done").innerText = countDone;

  const filterValue = document.getElementById("filterStatus").value;

  // เคลียร์คอลัมน์
  const colTodo = document.getElementById("col-todo");
  const colInProgress = document.getElementById("col-inprogress");
  const colDone = document.getElementById("col-done");
  [colTodo, colInProgress, colDone].forEach((col) => (col.innerHTML = ""));

  const tasksToRender =
    filterValue === "All"
      ? allTasks
      : allTasks.filter((t) => t.status === filterValue);

  if (tasksToRender.length === 0) {
    colTodo.innerHTML = `
      <div class="empty-placeholder">
        <i class="fas fa-folder-open"></i>
        <p>No tasks found in this category.</p>
      </div>
    `;
    return;
  }

  // วาดการ์ดลงแต่ละคอลัมน์
  tasksToRender.forEach((task) => {
    const card = document.createElement("div");
    card.className = "task-card";
    card.setAttribute("draggable", "true");
    card.dataset.id = task.id;
    card.dataset.status = task.status;

    // เลือกคลาสสีตามสถานะ
    let borderClass = "border-todo";
    let badgeClass = "badge-todo";
    if (task.status === "In Progress") {
      borderClass = "border-progress";
      badgeClass = "badge-progress";
    } else if (task.status === "Done") {
      borderClass = "border-done";
      badgeClass = "badge-done";
    }
    card.classList.add(borderClass);

    // คลาส priority สำหรับ badge
    const priority = task.priority || "Medium";
    const priorityClass = "priority-" + priority.toLowerCase();

    card.innerHTML = `
      <span class="task-badge ${badgeClass}">${task.status}</span>
      <div class="task-card-content">
        <h3>${task.title}</h3>
        <div class="task-card-meta">
          <span class="priority-badge ${priorityClass}">
            ${priority}
          </span>
        </div>
        <p>${task.description || "-"}</p>
      </div>
      <div class="task-card-footer">
        <button class="btn-delete" data-id="${task.id}">
          <i class="fas fa-trash-alt"></i> Delete
        </button>
      </div>
    `;

    // ผูก event ลบ
    card.querySelector(".btn-delete").addEventListener("click", () => {
      deleteTask(task.id);
    });

    // ผูก drag event
    card.addEventListener("dragstart", handleDragStart);

    if (task.status === "To Do") colTodo.appendChild(card);
    else if (task.status === "In Progress") colInProgress.appendChild(card);
    else if (task.status === "Done") colDone.appendChild(card);
  });
}

// 4. Delete
async function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  try {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("API not found");
    loadTasks();
  } catch (err) {
    console.warn("API Error (Preview Mode):", err);
    mockTasks = mockTasks.filter((t) => t.id !== id);
    allTasks = mockTasks;
    renderTasks();
  }
}

// 5. Drag & Drop เหมือน Trello
let draggedId = null;

function handleDragStart(e) {
  draggedId = e.target.dataset.id;
  e.dataTransfer.effectAllowed = "move";
}

function setupDragAndDrop() {
  const columns = document.querySelectorAll(".board-column-body");

  columns.forEach((col) => {
    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      col.classList.add("drop-hover");
    });

    col.addEventListener("dragleave", () => {
      col.classList.remove("drop-hover");
    });

    col.addEventListener("drop", async (e) => {
      e.preventDefault();
      col.classList.remove("drop-hover");
      if (!draggedId) return;

      const newStatus = col.parentElement.getAttribute("data-status");
      await changeTaskStatus(Number(draggedId), newStatus);
      draggedId = null;
    });
  });
}

async function changeTaskStatus(id, newStatus) {
  try {
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) throw new Error("API not found");
    loadTasks();
  } catch (err) {
    console.warn("API Error (Preview Mode):", err);
    mockTasks = mockTasks.map((t) =>
      t.id === id ? { ...t, status: newStatus } : t
    );
    allTasks = mockTasks;
    renderTasks();
  }
}

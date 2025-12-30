require("dotenv").config();
const express = require("express");
const cors = require('cors');

const database = require("./database/connection");
const taskController = require("./src/controllers/taskController");
const errorHandler = require("./src/middleware/errorHandler");

const corsOptions = {
    origin: true, // อนุญาตทุก origins ใน development
    credentials: true,
    optionsSuccessStatus: 200
};

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.use(cors(corsOptions)); 

// --------------------------------------------------
// Middleware
// --------------------------------------------------
app.use(express.json());
app.use(express.static("public"));

// --------------------------------------------------
// Routes (สำคัญ: stats ต้องอยู่ก่อน :id)
// --------------------------------------------------
app.get("/api/tasks/stats", taskController.getStatistics.bind(taskController));

app.get("/api/tasks", taskController.getAllTasks.bind(taskController));
app.get("/api/tasks/:id", taskController.getTaskById.bind(taskController));
app.post("/api/tasks", taskController.createTask.bind(taskController));
app.put("/api/tasks/:id", taskController.updateTask.bind(taskController));
app.delete("/api/tasks/:id", taskController.deleteTask.bind(taskController));

app.patch(
  "/api/tasks/:id/next-status",
  taskController.moveToNextStatus.bind(taskController)
);

// --------------------------------------------------
// Start server
// --------------------------------------------------
async function startServer() {
  try {
    await database.connect(); // ⭐ สำคัญมาก

    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running at http://${HOST}:${PORT}`);
    });

  } catch (err) {
    console.error("❌ ไม่สามารถเริ่มเซิร์ฟเวอร์ได้:", err);
    process.exit(1);
  }
}

startServer();

// --------------------------------------------------
// Error handler (ต้องอยู่สุดท้าย)
// --------------------------------------------------

app.use(errorHandler);

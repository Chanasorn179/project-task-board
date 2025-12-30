console.log("🔥🔥 USING NEW taskService.js 🔥🔥");
const database = require("../../database/connection");

class TaskService {
  // ================= GET ALL TASKS =================
  async getAllTasks(filters = {}) {
    let sql = "SELECT * FROM tasks WHERE 1=1";
    const params = [];

    if (filters.status) {
      sql += " AND status = ?";
      params.push(filters.status);
    }

    if (filters.priority) {
      sql += " AND priority = ?";
      params.push(filters.priority);
    }

    sql += " ORDER BY created_at DESC";

    return await database.all(sql, params);
  }

  // ================= GET BY ID =================
  async getTaskById(id) {
    const task = await database.get(
      "SELECT * FROM tasks WHERE id = ?",
      [id]
    );

    if (!task) {
      throw new Error("ไม่พบงาน");
    }

    return task;
  }

  // ================= CREATE TASK =================
  async createTask(taskData) {
    const { title, description, status, priority } = taskData;

    if (!title || title.trim() === "") {
      throw new Error("ต้องมีรายละเอียดของงาน");
    }

    const validStatus = ["todo", "doing", "done"];
    const validPriority = ["low", "medium", "high"];

    console.log("SERVICE CREATE:", { status, priority });

    if (!validStatus.includes(status)) {
      throw new Error("ข้อมูลไม่ถูกต้อง: สถานะไม่ถูกต้อง");
    }

    if (!validPriority.includes(priority)) {
      throw new Error("ข้อมูลไม่ถูกต้อง: ระดับความสำคัญไม่ถูกต้อง");
    }

    const result = await database.run(
      `
      INSERT INTO tasks (title, description, status, priority)
      VALUES (?, ?, ?, ?)
      `,
      [
        title.trim(),
        description || "",
        status,
        priority,
      ]
    );

    return this.getTaskById(result.lastID);
  }

  // ================= UPDATE TASK =================
  async updateTask(id, updates) {
    const fields = [];
    const values = [];

    if (updates.title !== undefined) {
      fields.push("title = ?");
      values.push(updates.title);
    }

    if (updates.description !== undefined) {
      fields.push("description = ?");
      values.push(updates.description);
    }

    if (updates.status !== undefined) {
      const validStatus = ["todo", "doing", "done"];
      if (!validStatus.includes(updates.status)) {
        throw new Error("ข้อมูลไม่ถูกต้อง: สถานะไม่ถูกต้อง");
      }
      fields.push("status = ?");
      values.push(updates.status);
    }

    if (updates.priority !== undefined) {
      const validPriority = ["low", "medium", "high"];
      if (!validPriority.includes(updates.priority)) {
        throw new Error("ข้อมูลไม่ถูกต้อง: ระดับความสำคัญไม่ถูกต้อง");
      }
      fields.push("priority = ?");
      values.push(updates.priority);
    }

    if (fields.length === 0) {
      throw new Error("ไม่มีข้อมูลให้อัพเดท");
    }

    values.push(id);

    const result = await database.run(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.changes === 0) {
      throw new Error("ไม่พบงาน");
    }

    return this.getTaskById(id);
  }

  // ================= DELETE TASK =================
  async deleteTask(id) {
    const result = await database.run(
      "DELETE FROM tasks WHERE id = ?",
      [id]
    );

    if (result.changes === 0) {
      throw new Error("ไม่พบงาน");
    }

    return true;
  }

  // ================= STATS =================
  async getStatistics() {
    const rows = await database.all(`
      SELECT status, COUNT(*) as count
      FROM tasks
      GROUP BY status
    `);

    return rows.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {});
  }

  // ================= NEXT STATUS =================
  async moveToNextStatus(id) {
    const task = await this.getTaskById(id);

    const order = ["todo", "doing", "done"];
    const index = order.indexOf(task.status);

    if (index === -1 || index === order.length - 1) {
      throw new Error("งานนี้เสร็จสมบูรณ์แล้ว");
    }

    return this.updateTask(id, {
      status: order[index + 1],
    });
  }
}

module.exports = new TaskService();

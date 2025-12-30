console.log("USING FIXED taskController.js")
const taskService = require("../services/taskService");

class TaskController {
  /**
   * GET /api/tasks
   */
  async getAllTasks(req, res, next) {
    try {
      const filters = {};

      if (req.query.status) {
        filters.status = req.query.status.toString().trim().toLowerCase();
      }
      if (req.query.priority) {
        filters.priority = req.query.priority.toString().trim().toLowerCase();
      }

      const tasks = await taskService.getAllTasks(filters);

      res.json({
        success: true,
        data: tasks,
        count: tasks.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/:id
   */
  async getTaskById(req, res, next) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "ID ไม่ถูกต้อง",
        });
      }

      const task = await taskService.getTaskById(id);

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      if (error.message.includes("ไม่พบ")) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * POST /api/tasks
   */
  async createTask(req, res, next) {
    try {
      const taskData = {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status?.toString().trim().toLowerCase(),
        priority: req.body.priority?.toString().trim().toLowerCase(),
      };

      const task = await taskService.createTask(taskData);

      res.status(201).json({
        success: true,
        data: task,
        message: "สร้างงานสำเร็จ",
      });
    } catch (error) {
      if (
        error.message.includes("ข้อมูลไม่ถูกต้อง") ||
        error.message.includes("ต้องมีรายละเอียด")
      ) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * PUT /api/tasks/:id
   */
  async updateTask(req, res, next) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "ID ไม่ถูกต้อง",
        });
      }

      const updates = {};

      if (req.body.title !== undefined)
        updates.title = req.body.title;

      if (req.body.description !== undefined)
        updates.description = req.body.description;

      if (req.body.status !== undefined)
        updates.status = req.body.status.toString().trim().toLowerCase();

      if (req.body.priority !== undefined)
        updates.priority = req.body.priority.toString().trim().toLowerCase();

      const task = await taskService.updateTask(id, updates);

      res.json({
        success: true,
        data: task,
        message: "อัพเดทงานสำเร็จ",
      });
    } catch (error) {
      if (error.message.includes("ไม่พบ")) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      if (
        error.message.includes("ข้อมูลไม่ถูกต้อง") ||
        error.message.includes("ไม่สามารถ")
      ) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * DELETE /api/tasks/:id
   */
  async deleteTask(req, res, next) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "ID ไม่ถูกต้อง",
        });
      }

      await taskService.deleteTask(id);

      res.json({
        success: true,
        message: "ลบงานสำเร็จ",
      });
    } catch (error) {
      if (error.message.includes("ไม่พบ")) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * GET /api/tasks/stats
   */
  async getStatistics(req, res, next) {
    try {
      const stats = await taskService.getStatistics();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/tasks/:id/next-status
   */
  async moveToNextStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "ID ไม่ถูกต้อง",
        });
      }

      const task = await taskService.moveToNextStatus(id);

      res.json({
        success: true,
        data: task,
        message: "เปลี่ยนสถานะงานสำเร็จ",
      });
    } catch (error) {
      if (error.message.includes("ไม่พบ")) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      if (error.message.includes("เสร็จสมบูรณ์แล้ว")) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
      next(error);
    }
  }
}

module.exports = new TaskController();

/**
 * Database Connection (SQLite)
 * ใช้เป็น Data Source กลางสำหรับ Repository ทุกตัว
 */

require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class Database {
  constructor() {
    this.db = null;

    // กำหนด path ของ database แบบ absolute ป้องกันปัญหารันจากคนละโฟลเดอร์
    this.dbPath = path.resolve(process.env.DB_PATH || "./database/tasks.db");
  }

  /**
   * เชื่อมต่อฐานข้อมูล
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        return resolve(this.db); // ป้องกัน connect ซ้ำ
      }

      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error("❌ เชื่อมต่อฐานข้อมูลล้มเหลว:", err.message);
          reject(err);
        } else {
          console.log("✅ เชื่อมต่อฐานข้อมูลสำเร็จ:", this.dbPath);

          // เปิด foreign keys
          this.db.run("PRAGMA foreign_keys = ON");
          resolve(this.db);
        }
      });
    });
  }

  /**
   * ดึง instance ของ database
   */
  getConnection() {
    if (!this.db) {
      throw new Error(
        "ยังไม่ได้เชื่อมต่อฐานข้อมูล กรุณาเรียก database.connect()"
      );
    }
    return this.db;
  }

  /**
   * ปิดการเชื่อมต่อฐานข้อมูล
   */
  close() {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();

      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log("✅ ปิดการเชื่อมต่อฐานข้อมูลเรียบร้อย");
          this.db = null;
          resolve();
        }
      });
    });
  }

  // ======================================================
  // Helper methods (ใช้ใน Repository)
  // ======================================================

  /**
   * Run query (INSERT / UPDATE / DELETE)
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.getConnection().run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            lastID: this.lastID,
            changes: this.changes,
          });
        }
      });
    });
  }

  /**
   * Get single row
   */
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.getConnection().get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Get all rows
   */
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.getConnection().all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

// ======================================================
// Singleton instance
// ======================================================
const database = new Database();

module.exports = database;

# 🧩 Task Board – Layered Architecture Demo (Week 4)

Trello-like **Task Board API** สำหรับเดโมสถาปัตยกรรมแบบ **Layered (3-Tier)**  
พัฒนาต่อยอดจากงาน **Week 3 (Monolithic Architecture)**  
ใช้ **Node.js + Express + SQLite** และแยกโค้ดตามหลัก *Separation of Concerns*

---

## 👤 ผู้จัดทำ

ชื่อ: นาย ชนสรณ์ บุตรถา  

วิชา: ENGSE207 – Software Architecture  

สถาบัน: Rajamangala University of Technology Lanna (RMUTL) – Chiang Mai  

หัวข้อ: Layered Architecture – Task Board API (Week 4)

---

## 🚀 Overview

โปรเจกต์นี้เป็นการ **Refactor ระบบ Task Board จาก Monolithic เป็น Layered Architecture**  
โดยแยกความรับผิดชอบของโค้ดออกเป็นแต่ละชั้นอย่างชัดเจน

ระบบรองรับการจัดการ Task ผ่าน **RESTful API** เช่น:
- สร้าง Task
- แก้ไข / ลบ Task
- เปลี่ยนสถานะงาน
- ดูสถิติของ Task

---

## 🏗️ Architecture Overview

ระบบถูกออกแบบด้วย **Layered (3-Tier) Architecture** ประกอบด้วย

### 1️⃣ Presentation Layer (Controllers)
ตำแหน่ง: `src/controllers/`

หน้าที่:
- รับ HTTP Request จาก Client
- ตรวจสอบรูปแบบข้อมูลที่รับเข้ามา
- เรียกใช้งาน Business Logic Layer
- ส่ง Response กลับเป็น JSON

---

### 2️⃣ Business Logic Layer (Services)
ตำแหน่ง: `src/services/`

หน้าที่:
- กำหนดกฎทางธุรกิจ (Business Rules)
- ตรวจสอบความถูกต้องของข้อมูลเชิงธุรกิจ
- ควบคุม workflow ของระบบ

ตัวอย่างกฎ:
- ชื่อ task ต้องมีอย่างน้อย 3 ตัวอักษร
- งานที่มี priority = HIGH ต้องมี description
- ไม่สามารถเปลี่ยนสถานะจาก DONE กลับไปเป็น TODO

---

### 3️⃣ Data Access Layer (Repositories)
ตำแหน่ง: `src/repositories/`

หน้าที่:
- ติดต่อฐานข้อมูล SQLite
- จัดการ CRUD operations
- เขียน SQL queries
- แปลงข้อมูลจากฐานข้อมูลเป็น Model

---

## ✨ Features

- 📌 CRUD Task ผ่าน REST API
- 🔄 เปลี่ยนสถานะ Task (TODO → IN_PROGRESS → DONE)
- ⚡ รองรับ Priority (LOW / MEDIUM / HIGH)
- 📊 ดูสถิติ Task แยกตามสถานะและ priority
- 🧠 Business Rules แยกจาก HTTP และ Database อย่างชัดเจน
- 🧱 โค้ดอ่านง่าย ดูแลง่าย และขยายต่อได้

---

## 🔌 API Endpoints

### Tasks
- `GET /api/tasks` – ดึง task ทั้งหมด
- `GET /api/tasks/:id` – ดึง task ตาม ID
- `POST /api/tasks` – สร้าง task ใหม่
- `PUT /api/tasks/:id` – แก้ไข task
- `DELETE /api/tasks/:id` – ลบ task

### Statistics
- `GET /api/tasks/stats` – ดูสถิติของ tasks

### Actions
- `PATCH /api/tasks/:id/next-status` – เลื่อนสถานะงานไปขั้นถัดไป

---

## 🧪 Testing

ระบบถูกทดสอบผ่าน **Postman** โดยครอบคลุม:
- การสร้าง task (ถูกต้อง / ผิด validation)
- การแก้ไขและลบ task
- การเปลี่ยนสถานะงาน
- การตรวจสอบ Business Rules
- HTTP Status Codes และ Error Handling

---

## 🧱 Tech Stack

- **Backend**
  - Node.js
  - Express.js
  - SQLite3
  - dotenv

- **Architecture**
  - Layered (3-Tier)
  - Separation of Concerns
  - RESTful API

---

## 📁 Project Structure

```bash
week4-layered/
├── server.js                # Application entry point
├── database/
│   ├── tasks.db             # SQLite database
│   └── connection.js        # Database connection
├── src/
│   ├── controllers/         # Presentation Layer
│   ├── services/            # Business Logic Layer
│   ├── repositories/        # Data Access Layer
│   ├── models/              # Data Models
│   └── middleware/          # Error handling
├── public/
├── .env
└── README.md
```
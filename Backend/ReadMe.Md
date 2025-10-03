# 🚀 HRMS Backend – Setup & Installation Guide

This is the backend of the Human Resource Management System (HRMS) built with **Node.js**, **Express**, **TypeScript**, and **Prisma ORM**. This guide will walk you through setting up the project from cloning to running the APIs via Postman.

---

## 📦 Tech Stack

- **Node.js** + **Express.js**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **JWT Authentication**
- **REST API**
- **Postman**

---

## 🧰 Prerequisites

Make sure you have the following installed:

- **Node.js** (v18+)
- **npm** or **yarn**
- **PostgreSQL** (Locally or Remote)
- **Git**
- **Postman** (for testing)

---

## 🔁 Project Setup

### 1. 📂 Clone the Repository

```bash
git clone https://github.com/your-org/hrms-backend.git
cd hrms-backend


🧱 Initialize Database (Prisma)
# 1. 📄 Generate Prisma Client

npx prisma generate

# 2. 🗂 Push Schema to Database

npx prisma db push

# 🚀 Run the Backend Server
npm run dev

# the server will run at: http://localhost:5000



🔐 Authentication Flow
Register via /api/auth/register

Login via /api/auth/login

Use the returned JWT token in Postman > Authorization > Bearer Token

📬 API Endpoints (Key Modules)
Auth
POST /api/auth/register

POST /api/auth/login

Profile
POST /api/profile → (Auto-detects user from token)

GET /api/profile/me

PUT /api/profile

Employee Management
POST /api/employees

GET /api/employees

GET /api/employees/:id

PUT /api/employees/:id

DELETE /api/employees/:id


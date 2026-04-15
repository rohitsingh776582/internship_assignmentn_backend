# ⚙️ Backend — Task Manager

Node.js + Express + PostgreSQL (Supabase) REST API for the Task Manager application.

---

##  Tech Stack

| Package | Version |
|---------|---------|
| Node.js | >= 18 |
| Express | v5 |
| PostgreSQL (Supabase) | pg v8 |
| JWT | jsonwebtoken v9 |
| Password Hashing | bcrypt v6 |
| Environment Variables | dotenv v17 |
| Dev Server | nodemon v3 |

---

##  Folder Structure

```
backend/
├── config/
│   └── db.js                 # PostgreSQL pool connection
├── controllers/
│   ├── userController.js     # signup, login
│   └── taskController.js     # createTask, getTasks, updateTask, deleteTask, toggleStatus
├── middleware/
│   └── authMiddleware.js     # JWT verification middleware
├── migrations/
│   ├── users.sql             # Users table schema
│   └── tasks.sql             # Tasks table schema
├── routes/
│   ├── userRoutes.js         # /api/users
│   └── taskRoutes.js         # /api/tasks
├── .env
├── index.js                  # App entry point
└── package.json
```

---

## ⚙️ Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Create `.env` file

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/postgres
PORT=3000
```

### 3. Setup Database

Run these SQL scripts in your **Supabase SQL Editor**:

**Users Table:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    admin_secret_code VARCHAR(50),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Tasks Table:**
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT false,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Start the server

```bash
npm run dev
```

Runs on: `http://localhost:3000`

---

##  API Endpoints

### Auth — `/api/users`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/users/signup` | Register new user |  
| POST | `/api/users/login` | Login & receive JWT | 

**POST `/api/users/signup`**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "admin_secret_code": "ADMIN123"
}
```
> Leave `admin_secret_code` empty for regular user. Use `ADMIN123` for admin role.

**POST `/api/users/login`**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "admin_secret_code": "ADMIN123"
}
```
Returns:
```json
{
  "message": "Login successful",
  "token": "<jwt_token>",
  "user": { "id": "...", "full_name": "...", "email": "...", "role": "user" }
}
```

---

### Tasks — `/api/tasks`

> All task routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks for logged-in user |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update task title & description |
| DELETE | `/api/tasks/:id` | Delete a task |
| PATCH | `/api/tasks/:id/status` | Toggle task status (true/false) |

**POST / PUT Body:**
```json
{
  "title": "My Task",
  "description": "Optional description"
}
```

---

##  Auth Middleware

Every protected route verifies the JWT token from the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

- Valid token → attaches `req.user = { id, role }` and calls `next()`
- Invalid / missing token → returns `401` or `403`

---

## 👤 Roles

| Role | How to get | Notes |
|------|-----------|-------|
| `user` | Default on signup | Can manage own tasks only |
| `admin` | Signup with `admin_secret_code: ADMIN123` | Must provide code on login too |

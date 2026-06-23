# Project & Task Management API

A production-ready RESTful API for managing projects and their nested tasks. Features JWT authentication, role-based access control, comprehensive input validation, and full CRUD operations with pagination, sorting, and filtering.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development Setup](#local-development-setup)
  - [Docker Setup](#docker-setup-recommended)
- [Environment Variables](#environment-variables)
- [Database](#database)
  - [Entity Relationship Diagram](#entity-relationship-diagram)
  - [Migrations](#migrations)
  - [Seeding](#seeding)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Projects](#projects)
  - [Tasks](#tasks)
- [Validation](#validation)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Available Scripts](#available-scripts)

---

## Tech Stack

| Category         | Technology                          |
| ---------------- | ----------------------------------- |
| **Runtime**      | Node.js (v18+)                      |
| **Framework**    | Express.js v5                       |
| **Language**     | TypeScript                          |
| **Database**     | PostgreSQL                          |
| **ORM**          | TypeORM                             |
| **Auth**         | JWT (jsonwebtoken) + bcrypt         |
| **Validation**   | Zod                                 |
| **API Docs**     | Swagger / OpenAPI 3.0               |
| **Testing**      | Jest + ts-jest                      |
| **Containerization** | Docker + Docker Compose         |

---

## Features

### Core
- **Authentication & Authorization** — Secure user registration and login with JWT access tokens. All resource endpoints are protected.
- **Project Management** — Full CRUD (Create, Read, Update, Delete) for projects scoped to the authenticated user.
- **Task Management** — Nested task CRUD under projects, including status tracking (`Pending` → `In Progress` → `Done`) and priority levels (`Low`, `Medium`, `High`).
- **Task Filtering** — Filter tasks by `status` or `priority` via query parameters.

### Bonus
- **Pagination & Sorting** — All list endpoints support `page`, `limit`, `sortBy`, and `order` query parameters.
- **Role-Based Access Control (RBAC)** — `Admin` and `Member` roles. Admins can access a dedicated endpoint to view all projects across the system.
- **Unit Tests** — 11 test suites with 60+ unit tests covering controllers, services, middlewares, and utilities.
- **Docker Compose** — One-command setup for the entire stack (API + PostgreSQL).
- **TypeScript** — Full type safety across the entire codebase.

---

## Architecture

The project follows a **layered architecture** pattern with clear separation of concerns:

```
Request → Routes → Middleware (Auth, Validation) → Controllers → Services → Models/DB
```

| Layer          | Responsibility                                                                 |
| -------------- | ------------------------------------------------------------------------------ |
| **Routes**     | Define endpoints, mount middleware, and wire up controllers                     |
| **Middleware** | Handle cross-cutting concerns: JWT authentication, role authorization, Zod validation, error handling |
| **Controllers**| Parse request parameters, call the appropriate service, and format the HTTP response |
| **Services**   | Contain all core business logic, database queries, access control checks       |
| **Models**     | TypeORM entity definitions that map to PostgreSQL tables                        |

---

## Project Structure

```
Project & Task Management API/
├── .dockerignore             # Files excluded from Docker builds
├── .env.example              # Template for environment variables
├── .gitignore                # Git ignore rules
├── Dockerfile                # Docker image definition
├── docker-compose.yml        # Multi-container Docker setup (API + PostgreSQL)
├── jest.config.js            # Jest testing configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript compiler options
│
└── src/
    ├── app.ts                # Express app setup (middleware, routes, error handlers)
    ├── server.ts             # Server entry point (connects DB and starts listening)
    │
    ├── config/
    │   └── database.ts       # TypeORM DataSource configuration
    │
    ├── models/               # TypeORM entities
    │   ├── User.ts           # User entity (id, name, email, password, role)
    │   ├── Project.ts        # Project entity (id, title, description, status)
    │   └── Task.ts           # Task entity (id, title, description, status, priority, dueDate)
    │
    ├── routes/               # Express route definitions
    │   ├── authRoutes.ts     # POST /register, POST /login
    │   ├── projectRoutes.ts  # Project CRUD + mounts task sub-routes
    │   └── taskRoutes.ts     # Task CRUD (uses mergeParams for nested :id)
    │
    ├── controllers/          # Request/response handlers (thin layer)
    │   ├── authController.ts
    │   ├── projectController.ts
    │   └── taskController.ts
    │
    ├── services/             # Business logic layer
    │   ├── authService.ts    # Registration, login, token generation
    │   ├── projectService.ts # Project CRUD, pagination, admin access
    │   └── taskService.ts    # Task CRUD, filtering, project access verification
    │
    ├── middlewares/          # Express middleware
    │   ├── auth.ts           # JWT token verification (authenticate)
    │   ├── role.ts           # Role-based authorization (authorize)
    │   ├── validate.ts       # Zod schema validation
    │   └── errorHandler.ts   # Global error handler + 404 handler
    │
    ├── utils/                # Helper functions
    │   ├── auth.ts           # hashPassword, comparePassword, generateToken
    │   └── validators.ts     # Zod schemas for all request bodies
    │
    ├── migrations/           # TypeORM database migrations
    │   └── 1782213783122-InitialSchema.ts
    │
    ├── scripts/              # Utility scripts
    │   └── seed.ts           # Database seeder (creates test users + sample data)
    │
    ├── types/                # Custom TypeScript type definitions
    │   └── express.d.ts      # Express Request augmentation (user property)
    │
    └── docs/                 # API documentation
        └── swagger.json      # OpenAPI 3.0 specification
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/) v15+ **OR** [Docker](https://www.docker.com/)

### Local Development Setup

**1. Clone and install dependencies**

```bash
git clone https://github.com/mo74x/Project-Task-Management-System.git
cd Project-Task-Management-System
npm install
```

**2. Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your local PostgreSQL credentials (see [Environment Variables](#environment-variables)).

**3. Set up the database**

Make sure PostgreSQL is running and the database exists:

```bash
# Run migrations to create tables
npm run migration:run

# (Optional) Seed the database with test data
npm run seed
```

**4. Start the development server**

```bash
npm run dev
```

The server starts at **http://localhost:3000**.
Interactive API documentation is available at **http://localhost:3000/api-docs**.

---

### Docker Setup (Recommended)

Run the entire stack with a single command — no local PostgreSQL installation needed:

```bash
# Build and start containers
docker-compose up -d --build
```

This starts:
- **PostgreSQL** database on port `5432`
- **Node.js API** on port `3000`

To stop the containers:

```bash
docker-compose down
```

> **Note:** When using Docker Compose, `DB_HOST` is automatically set to `db` (the service name). You do not need to modify this.

---

## Environment Variables

Create a `.env` file in the project root based on `.env.example`:

| Variable        | Description                          | Default              |
| --------------- | ------------------------------------ | -------------------- |
| `PORT`          | Server port                          | `3000`               |
| `NODE_ENV`      | Environment mode                     | `development`        |
| `DB_HOST`       | PostgreSQL host                      | `localhost`          |
| `DB_PORT`       | PostgreSQL port                      | `5432`               |
| `DB_USER`       | PostgreSQL username                  | `postgres`           |
| `DB_PASSWORD`   | PostgreSQL password                  | —                    |
| `DB_NAME`       | PostgreSQL database name             | `electropi_db`       |
| `JWT_SECRET`    | Secret key for signing JWT tokens    | —                    |
| `JWT_EXPIRES_IN`| Token expiration duration            | `1d`                 |

---

## Database

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│    Users     │       │    Projects      │       │       Tasks          │
├──────────────┤       ├──────────────────┤       ├──────────────────────┤
│ id (UUID PK) │──┐    │ id (UUID PK)     │──┐    │ id (UUID PK)        │
│ name         │  │    │ title            │  │    │ title               │
│ email (UQ)   │  │    │ description      │  │    │ description         │
│ password     │  └──1:N│ status           │  └──1:N│ status (enum)       │
│ role (enum)  │       │ userId (FK)      │       │ priority (enum)     │
│ createdAt    │       │ createdAt        │       │ dueDate             │
│ updatedAt    │       │ updatedAt        │       │ projectId (FK)      │
└──────────────┘       └──────────────────┘       │ createdAt           │
                                                  │ updatedAt           │
                                                  └──────────────────────┘
```

**Relationships:**
- A **User** has many **Projects** (one-to-many)
- A **Project** has many **Tasks** (one-to-many, cascade delete)

**Enums:**
- `UserRole`: `Admin` | `Member`
- `TaskStatus`: `Pending` | `In Progress` | `Done`
- `TaskPriority`: `Low` | `Medium` | `High`

### Migrations

TypeORM migrations are located in `src/migrations/`. They define the full schema including tables, constraints, and enums.

```bash
npm run migration:run       # Apply pending migrations
npm run migration:revert    # Revert the last migration
npm run migration:generate  # Generate a new migration from entity changes
```

### Seeding

The seed script (`src/scripts/seed.ts`) clears existing data and creates:

| Account     | Email                    | Password     | Role     |
| ----------- | ------------------------ | ------------ | -------- |
| **Admin**   | `admin@electropi.com`    | `admin123`   | Admin    |
| **Member**  | `member@electropi.com`   | `member123`  | Member   |

It also creates a sample project with two tasks assigned to the Member user.

```bash
npm run seed
```

---

## API Reference

> **Base URL:** `http://localhost:3000`
>
> **Interactive Docs:** `http://localhost:3000/api-docs` (Swagger UI)

All endpoints except `/api/auth/*` require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

### Authentication

| Method | Endpoint             | Description                    | Auth |
| ------ | -------------------- | ------------------------------ | ---- |
| `POST` | `/api/auth/register` | Register a new user            | No   |
| `POST` | `/api/auth/login`    | Login and receive a JWT token  | No   |

**Register — Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login — Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Projects

| Method   | Endpoint                  | Description                                | Auth         |
| -------- | ------------------------- | ------------------------------------------ | ------------ |
| `POST`   | `/api/projects`           | Create a new project                       | Yes          |
| `GET`    | `/api/projects`           | Get all projects for the authenticated user| Yes          |
| `GET`    | `/api/projects/admin/all` | Get ALL projects in the system             | Yes (Admin)  |
| `GET`    | `/api/projects/:id`       | Get a specific project by ID (with tasks)  | Yes          |
| `PUT`    | `/api/projects/:id`       | Update a project                           | Yes          |
| `DELETE` | `/api/projects/:id`       | Delete a project (cascades to tasks)       | Yes          |

**Query Parameters (GET `/api/projects`):**

| Param    | Type    | Default     | Description                          |
| -------- | ------- | ----------- | ------------------------------------ |
| `page`   | integer | `1`         | Page number                          |
| `limit`  | integer | `10`        | Items per page                       |
| `sortBy` | string  | `createdAt` | Field to sort by                     |
| `order`  | string  | `DESC`      | Sort direction (`ASC` or `DESC`)     |

### Tasks

Tasks are nested under projects. All task endpoints require authentication.

| Method   | Endpoint                                       | Description                    |
| -------- | ---------------------------------------------- | ------------------------------ |
| `POST`   | `/api/projects/:projectId/tasks`               | Create a task under a project  |
| `GET`    | `/api/projects/:projectId/tasks`               | Get all tasks for a project    |
| `GET`    | `/api/projects/:projectId/tasks/:taskId`       | Get a specific task by ID      |
| `PUT`    | `/api/projects/:projectId/tasks/:taskId`       | Update a task                  |
| `DELETE` | `/api/projects/:projectId/tasks/:taskId`       | Delete a task                  |

**Query Parameters (GET `/api/projects/:projectId/tasks`):**

| Param      | Type    | Default     | Description                                       |
| ---------- | ------- | ----------- | ------------------------------------------------- |
| `page`     | integer | `1`         | Page number                                        |
| `limit`    | integer | `10`        | Items per page                                     |
| `sortBy`   | string  | `createdAt` | Field to sort by                                   |
| `order`    | string  | `DESC`      | Sort direction (`ASC` or `DESC`)                   |
| `status`   | string  | —           | Filter by status: `Pending`, `In Progress`, `Done` |
| `priority` | string  | —           | Filter by priority: `Low`, `Medium`, `High`        |

**Create Task — Request Body:**
```json
{
  "title": "Setup Database Schema",
  "description": "Create TypeORM entities and migrations",
  "status": "Pending",
  "priority": "High",
  "dueDate": "2026-12-31"
}
```

---

## Validation

All request bodies are validated at the route level using **Zod** schemas before reaching the controller. Invalid requests receive a `400` response with structured error messages:

```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" },
    { "field": "password", "message": "Password must be at least 6 characters long" }
  ]
}
```

**Validation Rules:**

| Field         | Rules                                                    |
| ------------- | -------------------------------------------------------- |
| `name`        | Required, minimum 3 characters                           |
| `email`       | Required, must be a valid email format                   |
| `password`    | Required, minimum 6 characters                           |
| `title`       | Required, minimum 3 characters                           |
| `description` | Optional, string                                         |
| `status`      | Optional, must be one of the allowed enum values         |
| `priority`    | Optional, must be `Low`, `Medium`, or `High`             |
| `dueDate`     | Optional, date string                                    |

---

## Error Handling

The API uses a centralized error handling middleware. All errors return consistent JSON responses:

```json
{
  "message": "Project not found or access denied",
  "stack": "..." 
}
```

> The `stack` field is only included when `NODE_ENV=development`.

| Status Code | Meaning                                          |
| ----------- | ------------------------------------------------ |
| `400`       | Bad Request — Validation error                   |
| `401`       | Unauthorized — Missing or invalid JWT token      |
| `403`       | Forbidden — Insufficient role permissions        |
| `404`       | Not Found — Resource doesn't exist or no access  |
| `500`       | Internal Server Error                            |

---

## Testing

The project uses **Jest** with **ts-jest** for unit testing. Tests mock the service layer and TypeORM repositories — no live database connection is needed.

```bash
# Run the full test suite
npm test

# Run with verbose output
npx jest --forceExit --verbose
```

### Test Coverage Overview

| Layer          | Test Suite                           | Tests |
| -------------- | ------------------------------------ | ----- |
| **Services**   | `authService.test.ts`                | 5     |
| **Services**   | `projectService.test.ts`             | 9     |
| **Services**   | `taskService.test.ts`                | 9     |
| **Controllers**| `authController.test.ts`             | 4     |
| **Controllers**| `projectController.test.ts`          | 6     |
| **Controllers**| `taskController.test.ts`             | 8     |
| **Middleware** | `auth.test.ts`                       | 4     |
| **Middleware** | `role.test.ts`                       | 3     |
| **Middleware** | `validate.test.ts`                   | 3     |
| **Middleware** | `errorHandler.test.ts`               | 5     |
| **Utilities**  | `auth.test.ts`                       | 4     |
| **Total**      | **11 suites**                        | **60+** |

---

## Available Scripts

| Script                    | Description                                                  |
| ------------------------- | ------------------------------------------------------------ |
| `npm run dev`             | Start the development server with hot-reload (ts-node-dev)   |
| `npm run build`           | Compile TypeScript to JavaScript (`dist/`)                   |
| `npm start`               | Run the compiled production build                            |
| `npm test`                | Run the Jest test suite                                      |
| `npm run migration:run`   | Apply pending database migrations                            |
| `npm run migration:revert`| Revert the last applied migration                            |
| `npm run migration:generate` | Auto-generate a migration from entity changes             |
| `npm run seed`            | Clear the database and seed it with test data                |

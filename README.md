#  Project & Task Management API

A robust, RESTful API for managing users, projects, and nested tasks. Built with modern backend technologies, emphasizing type safety, validation, and comprehensive documentation.

## Tech Stack

*   **Runtime:** Node.js
*   **Framework:** Express 5
*   **Language:** TypeScript
*   **Database:** PostgreSQL
*   **ORM:** TypeORM
*   **Validation:** Zod
*   **Documentation:** Swagger / OpenAPI 3.0
*   **Testing:** Jest & Supertest
*   **Containerization:** Docker & Docker Compose

## Features

*   **Authentication & Authorization:**
    *   JWT-based secure authentication.
    *   Role-based access control (`Admin` and `Member`).
    *   Admins have elevated privileges (e.g., viewing all projects across the system).
*   **Project Management:**
    *   Create, read, update, and delete (CRUD) projects.
    *   Paginated project listings.
*   **Task Management:**
    *   Tasks are nested under specific projects.
    *   Full CRUD operations for tasks.
    *   Advanced filtering by `status` (Pending, In Progress, Done) and `priority` (Low, Medium, High).
    *   Pagination and sorting capabilities.
*   **API Documentation:**
    *   Interactive Swagger UI available at `/api-docs`.
*   **Data Validation:**
    *   Strict runtime request validation using Zod schemas.
*   **Error Handling:**
    *   Centralized error handling middleware.

## API Routes

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and retrieve a JWT token |

### Projects
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/projects` | Get all projects for the authenticated user | Yes |
| `POST` | `/api/projects` | Create a new project | Yes |
| `GET` | `/api/projects/admin/all`| Get ALL projects in the system | Yes (Admin) |
| `GET` | `/api/projects/:id` | Get a specific project by ID | Yes |
| `PUT` | `/api/projects/:id` | Update a specific project | Yes |
| `DELETE` | `/api/projects/:id` | Delete a specific project | Yes |

### Tasks
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/projects/:projectId/tasks` | Get all tasks for a project | Yes |
| `POST`| `/api/projects/:projectId/tasks` | Create a task under a project | Yes |
| `GET` | `/api/projects/:projectId/tasks/:taskId` | Get a specific task by ID | Yes |
| `PUT` | `/api/projects/:projectId/tasks/:taskId` | Update a specific task | Yes |
| `DELETE`| `/api/projects/:projectId/tasks/:taskId` | Delete a specific task | Yes |

## Prerequisites

Before running this project, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [PostgreSQL](https://www.postgresql.org/) (v15 or higher) OR [Docker](https://www.docker.com/)

## Local Development Setup

### 1. Clone the repository and install dependencies

```bash
git clone <repository-url>
cd electro-pi-api
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory and copy the contents from `.env.example`:

```bash
cp .env.example .env
```

Update the `.env` file with your local PostgreSQL credentials and a secure JWT secret.

### 3. Database Setup

Ensure your PostgreSQL service is running and the database specified in `DB_NAME` (default: `electropi_db`) is created.

```bash
# Run migrations to set up the database schema
npm run migration:run

# (Optional) Seed the database with initial test users and data
npm run seed
```

### 4. Start the Development Server

```bash
npm run dev
```

The server will start (default: `http://localhost:3000`).
You can access the interactive API documentation at `http://localhost:3000/api-docs`.

## Docker Setup (Recommended)

You can easily run the entire application, including the PostgreSQL database, using Docker Compose.

```bash
# Build and start the containers in the background
docker-compose up -d --build
```

The API will be available at `http://localhost:3000`. Docker Compose automatically sets up the database and links the services.

To stop the containers:

```bash
docker-compose down
```

## Testing

The project uses Jest for unit and integration testing.

```bash
# Run the test suite
npm run test
```

## Database Scripts

*   `npm run typeorm`: Base TypeORM CLI command.
*   `npm run migration:generate`: Generate a new migration based on schema changes.
*   `npm run migration:run`: Execute pending migrations.
*   `npm run migration:revert`: Revert the last applied migration.
*   `npm run seed`: Clear the database and seed it with test accounts (Admin and Member) and dummy data.

### Test Accounts (from Seeder)

*   **Admin:** `admin@electropi.com` / `admin123`
*   **Member:** `member@electropi.com` / `member123`

## Project Structure

```text
src/
├── config/         # Database and Swagger configurations
├── controllers/    # Route controllers (request parsing, response returning)
├── middlewares/    # Express middlewares (auth, validation, errors)
├── migrations/     # TypeORM database migrations
├── models/         # TypeORM entities (User, Project, Task)
├── routes/         # Express route definitions
├── scripts/        # Utility scripts (e.g., seed.ts)
├── services/       # Core business logic layer
├── types/          # Custom TypeScript type definitions
├── utils/          # Helper functions, authentication utilities, and Zod schemas
├── docs/           # Swagger JSON definition
├── app.ts          # Express application setup
└── server.ts       # Server entry point
```

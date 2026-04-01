# HRMS Lite

## Deployed

| App        | URL |
| ---------- | --- |
| Frontend   | [https://hrms-lite-server.vercel.app/](https://hrms-lite-server.vercel.app/) |
| Backend API | [https://hrmslite-0mkk.onrender.com/](https://hrmslite-0mkk.onrender.com/) |

Production API base URL: `https://hrmslite-0mkk.onrender.com/api`

## Project Structure

```
HRMSLite/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── app/          # Pages (Dashboard, Employees, Attendance)
│   │   ├── components/   # Reusable UI components
│   │   ├── lib/          # API client (axios)
│   │   └── types/        # TypeScript interfaces
│   └── server/           # Express API backend
│       └── src/
│           ├── routes/       # REST API routes
│           ├── controllers/    # Business logic
│           ├── middleware/     # Validation & error handling
│           └── validations/    # Zod schemas
├── packages/
│   ├── db/               # Prisma schema & client (shared)
│   ├── ui/               # Shared UI components
│   ├── eslint-config/    # Shared ESLint config
│   └── typescript-config/# Shared TS config
└── turbo.json            # Turborepo config
```

## API Endpoints

Base URL (local): `http://localhost:<PORT>/api` — set `PORT` in `apps/server/.env` (default in code is `5000` unless you override it).

Base URL (deployed): `https://hrmslite-0mkk.onrender.com/api`

| Method | Endpoint                         | Description                    |
| ------ | -------------------------------- | ------------------------------ |
| GET    | `/api/health`                    | Health check                   |
| GET    | `/api/employees`                 | List all employees             |
| GET    | `/api/employees/:id`             | Get employee by ID             |
| POST   | `/api/employees`                 | Create employee                |
| DELETE | `/api/employees/:id`             | Delete employee (+ attendance) |
| POST   | `/api/attendance`                | Mark / upsert attendance       |
| GET    | `/api/attendance/employee/:id`   | Attendance for an employee     |
| GET    | `/api/dashboard/summary`         | Dashboard stats                |

## Running Locally

### Prerequisites

- [Bun](https://bun.sh) (see root `package.json` / lockfile)
- PostgreSQL (local Docker, Neon, etc.)

### Setup

1. **Install dependencies** (from repo root)

   ```bash
   bun install
   ```

2. **Environment variables**

   - `packages/db/.env` — `DATABASE_URL` for Prisma (migrations, generate).
   - `apps/server/.env` — same `DATABASE_URL`, plus `PORT` (e.g. `5000`).
   - `apps/web/.env.local` — `NEXT_PUBLIC_API_URL=http://localhost:<PORT>/api` (match server `PORT`).

3. **Prisma generate and migrate** (from `packages/db`)

   ```bash
   cd packages/db
   bunx prisma generate
   bunx prisma migrate dev
   ```

4. **Start dev** (from repo root)

   ```bash
   bun run dev
   ```

   Frontend: `http://localhost:3000`  
   Backend: `http://localhost:<PORT>` (same `PORT` as in `apps/server/.env`).

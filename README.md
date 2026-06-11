# Tea Estate System — Backend API

Express.js backend for the Tea Estate Management System, built with TypeScript, MySQL, and Prisma ORM.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5
- **Language:** TypeScript
- **Database:** MySQL
- **ORM:** Prisma 7 (with MariaDB driver adapter)
- **Validation:** Zod
- **Security:** Helmet, CORS
- **Logging:** Morgan (HTTP), custom logger (application)

## Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/          # Migration history
│   └── seed.ts              # Database seed script
├── src/
│   ├── config/              # Environment & database config
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Express middleware
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic layer
│   ├── utils/               # Shared utilities
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── generated/prisma/        # Generated Prisma Client
├── prisma.config.ts         # Prisma CLI configuration
└── .env.example             # Environment variable template
```

## Prerequisites

- Node.js 20+
- MySQL 8.0+ (or MariaDB 10.5+)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and update your MySQL credentials:

```bash
cp .env.example .env
```

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="mysql://root:password@localhost:3306/tea_estate_db"
```

Create the database in MySQL before running migrations:

```sql
CREATE DATABASE tea_estate_db;
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Run migrations (after models are defined)

```bash
npm run prisma:migrate
```

### 5. Start development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Generate Prisma client and compile TypeScript |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create and apply migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:seed` | Seed the database |

## API Base URL

`http://localhost:3000/api/v1`

## API Modules

| Module | Base path | Auth |
|--------|-----------|------|
| Health | `/health` | Public |
| Auth | `/auth` | Login public; others JWT |
| Estates & sections | `/estates` | JWT + estate scope |
| Services | `/services` | JWT (mutations: Admin) |
| Users | `/users` | JWT + Admin only |
| Employees | `/employees` | JWT + estate scope |
| Assignments | `/assignments` | JWT + estate scope |
| Expenses | `/expenses` | JWT + estate scope |
| Events | `/events` | JWT + estate scope |
| Dashboard | `/dashboard` | JWT + estate scope |
| TV display | `/tv` | JWT + estate scope |

## Response Format

```json
// Success
{ "success": true, "data": { } }

// Error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": { } } }
```

## Roles

| Role | Access |
|------|--------|
| Administrator | Full access to all estates and modules |
| Planter | Scoped to `assignedEstateId` on data modules |
| Supervisor | Scoped to `assignedEstateId` on data modules |

## Architecture Notes

- **Layered structure:** routes → controllers → services → database
- **Environment validation:** all env vars validated at startup via Zod
- **Error handling:** centralized error middleware with consistent JSON responses
- **Graceful shutdown:** SIGINT/SIGTERM handlers disconnect Prisma cleanly
- **Single Prisma instance:** reused across the app to avoid connection pool exhaustion

## Pending (awaiting client input)

- Reports (`/reports/...`) and CSV export
- Backups (`/backups/...`) and auto-backup scheduler

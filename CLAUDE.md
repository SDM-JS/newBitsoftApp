# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Student management backend API built with Express.js, Prisma ORM, and PostgreSQL. Supports students, admins, courses, groups, homework, news, and a quiz/leaderboard system.

## Commands

```bash
pnpm dev              # Start development server with nodemon
pnpm start            # Start production server
pnpm test             # Run Jest tests
pnpm migrate          # Reset DB, run migrations, and generate Prisma client
```

### Running single tests
```bash
pnpm test -- tests/auth.test.js
```

## Architecture

**Entry point:** `index.js` → imports `app.js` (Express setup)

**Structure:**
- `controllers/` — Request handlers (auth, manager, test)
- `routes/` — Express routers mapping endpoints to controllers
- `middleware/` — JWT auth middleware, global error handler
- `prisma/schema.prisma` — Database schema and Prisma models
- `lib/prisma.js` — Prisma client singleton with Neon/PostgreSQL adapter

**Authentication:** JWT-based (HS512, 365d expiry). Token passed as `Bearer <token>`. Middleware at `middleware/auth.middleware.js` resolves user from `Admin` or `Student` table and attaches `req.student` with role (`org::admin` or `student`).

**Database:** PostgreSQL via Prisma. Connection string in `DATABASE_URL` (`.env`).

**Key models:** `Student`, `Admin`, `Course`, `Group`, `Homework`, `News`, `QuizSchema`, `Variants`, `Submission`, `StudentActivity`, `Notes`

**API pattern:** All routes prefixed with `/api/*`. Protected routes use `authMiddleware`. Admin-only routes check `req.student.role !== "org::admin"` in controllers.

**Error handling:** `BaseError` class with static helpers (`BadRequest`, `Unauthorized`, `Forbidden`). Global error middleware at `middleware/error.middleware.js`.

## Environment Variables

Required in `.env`:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret key for JWT signing

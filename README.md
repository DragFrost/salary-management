# ACME Employee Salary Management System

A performant, full-stack salary management system and payroll insights dashboard for ACME Corp, managing 10,000 global employee records across multiple countries and currencies. Built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Drizzle ORM, and PostgreSQL.

---

## Prerequisites

- **Node.js:** `>= 20.9.0` (Recommended: Node 22+)
- **PostgreSQL:** `>= 14.0` (Local or hosted instance)
- **Package Manager:** `npm`

---

## Local Database Setup

### 1. Create Local Database
Start your local PostgreSQL service and create the database `acme_salary`:

```bash
# Using PostgreSQL CLI
createdb acme_salary

# Or via psql interactive console
psql -U postgres -c "CREATE DATABASE acme_salary;"
```

### 2. Configure Environment Variables
Copy the template configuration file:

```bash
cp .env.example .env
```

Edit `.env` to supply your PostgreSQL user and password:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/acme_salary
```

---

## Database Migrations

Apply the initial database schema (creates the `employees` table with indexes and constraints):

```bash
npm run db:migrate
```

To generate new migrations after updating schema definitions:

```bash
npm run db:generate
```

---

## Deterministic Seeding (10,000 Employees)

Populate the database with exactly 10,000 synthetic employee records:

```bash
npm run db:seed
```

### Seeding Characteristics
- **Deterministic Dataset:** Uses Mulberry32 pseudo-random generator with a fixed seed (`42`), ensuring 100% reproducible data across environments.
- **Multi-Country & Multi-Currency:** Generates synthetic records across 7 countries with realistic currency ranges:
  - United States (`USD`)
  - United Kingdom (`GBP`)
  - Germany (`EUR`)
  - India (`INR`)
  - Canada (`CAD`)
  - Australia (`AUD`)
  - Japan (`JPY`)
- **Reset Strategy:** Automatically truncates existing rows in the `employees` table prior to insertion, guaranteeing exactly 10,000 records without duplicate key collisions or dataset bloat when rerun.
- **Batch Processing:** Inserts records in batches of 500 rows to optimize throughput while staying within SQL parameter limits.
- **Synthetic Data Only:** Uses synthetic names and `.synthetic` email domains (`@acme-corp.synthetic`) to strictly protect data privacy.

---

## Running the Application

```bash
# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

### Health Check Endpoint
Verify database connectivity:

```bash
curl http://localhost:3000/api/health
```

Expected response when connected:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-11-19T00:00:00.000Z"
}
```

---

## Running Integration Tests

Integration tests run using Vitest against a dedicated test database to protect development data:

### 1. Create Dedicated Test Database
```bash
createdb acme_salary_test
```

### 2. Configure Environment Variable
In `.env`, define the mandatory `TEST_DATABASE_URL`:
```env
TEST_DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/acme_salary_test
```

### 3. Apply Schema Migrations to Test Database
```bash
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/acme_salary_test npm run db:migrate
```

### 4. Execute Integration Tests
```bash
npm test
```

> **Isolation Rule:** `TEST_DATABASE_URL` is mandatory. The test runner will immediately abort if `TEST_DATABASE_URL` is missing or matches `DATABASE_URL` to prevent accidental modification of the 10,000-employee development seed.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server |
| `npm run build` | Builds application for production |
| `npm run start` | Starts production server |
| `npm run lint` | Runs ESLint checks |
| `npm run typecheck` | Validates TypeScript types without emitting code |
| `npm test` | Runs Vitest backend integration tests |
| `npm run test:watch` | Runs Vitest in interactive watch mode |
| `npm run db:generate` | Generates SQL migrations from Drizzle schema |
| `npm run db:migrate` | Applies pending migrations to PostgreSQL |
| `npm run db:seed` | Seeds 10,000 deterministic synthetic employees |
| `npm run db:studio` | Launches Drizzle Studio database UI |

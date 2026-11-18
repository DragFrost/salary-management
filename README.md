# ACME Employee Salary Management System

A high-performance, full-stack salary management application and real-time payroll analytics dashboard built for ACME Corp HR Operations. The application manages **10,000 synthetic global employee records** across multiple countries and currencies, ensuring sub-second server-side filtering, exact monetary decimal precision, and strict multi-currency segregation.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Setup & Getting Started](#local-setup--getting-started)
- [Database Migrations & Seeding](#database-migrations--seeding)
- [Running Integration Tests](#running-integration-tests)
- [REST API Reference](#rest-api-reference)
- [Vercel Deployment Guide](#vercel-deployment-guide)
- [Demonstration & Reviewer Walkthrough](#demonstration--reviewer-walkthrough)
- [Available npm Scripts](#available-npm-scripts)

---

## Overview

- **User Persona:** HR Manager (Global Operations & Compensation).
- **Core Problem:** Managing international compensation across 10,000 employees without UI latency, data inconsistency, or mathematically invalid cross-currency summation.
- **Architectural Tenet:** Monolithic Next.js App Router pairing client-side rendering with server-side database querying, input validation via Zod, typed ORM queries via Drizzle, and analytical SQL aggregations executed directly in PostgreSQL.
- **Scope & Privacy:** Assessment prototype processing **100% synthetic employee records**. No real personal or confidential employee data is stored.

---

## Key Features

1. **Global Employee Directory:**
   - Responsive data table rendering employee code, full name, email, department, country, and compensation with currency indicator.
   - Server-side pagination with configurable page size (10, 20, 50, 100).
   - Multi-column case-insensitive search (`employeeCode`, `firstName`, `lastName`, `email`) using PostgreSQL `ILIKE`.
   - Exact-match dropdown filters for `Country` and `Department`.
2. **Employee Lifecycle (CRUD):**
   - Modal forms for creating and editing employee profiles with inline validation and conflict notifications.
   - Dedicated Employee Details modal displaying full employee profile and local compensation policy notices.
   - Delete confirmation dialog with immediate state synchronization.
   - Uniqueness defense: Dual-layer duplicate checking for `employeeCode` and `email` (application-level pre-checks and PostgreSQL `23505` error interception returning HTTP 409 Conflict).
3. **Real-Time SQL Payroll Analytics Dashboard:**
   - Headcount summary metrics and currency jurisdiction counts.
   - Payroll totals, average salaries, and exact continuous median salaries (`PERCENTILE_CONT(0.5)`) computed directly in PostgreSQL.
   - Country-wise and department-wise compensation breakdown tables.
   - Interactive Recharts bar chart comparing Average vs. Median salaries per department within a selected currency.
4. **Financial Integrity & Strict Currency Isolation:**
   - **Zero Cross-Currency Addition:** Different currencies (USD, EUR, GBP, INR, CAD, AUD, JPY) are never summed into an unqualified total.
   - **Exact Decimal Precision:** All monetary figures are stored as PostgreSQL `numeric(12, 2)` and validated as decimal strings. Never converted to IEEE 754 floating-point numbers.
5. **Deterministic 10,000 Employee Dataset:**
   - Seed script generates exactly 10,000 reproducible synthetic employee records using a fixed Mulberry32 PRNG seed (`42`).
   - Idempotent reset strategy truncates existing records prior to bulk insertion.

---

## Technology Stack

The project adheres to a strict, locked technology stack:

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Language** | TypeScript 5.x (Strict Mode) | End-to-end type safety spanning database schema, APIs, and UI components |
| **Framework** | Next.js 16 (App Router) | Unified repository, fast route handling, and server-side API endpoints |
| **Styling** | Tailwind CSS 3.x | Utility-first styling with custom enterprise theme tokens |
| **UI Components** | shadcn/ui & Lucide Icons | Accessible, unbloated component primitives built on Radix UI conventions |
| **Database** | PostgreSQL 14+ | Production-grade relational database with native continuous median aggregations |
| **ORM** | Drizzle ORM & Drizzle Kit | Zero-overhead, type-safe SQL query builder and schema migration management |
| **Validation** | Zod 3.x | Runtime schema validation with automatic TypeScript inference |
| **Charts** | Recharts 3.x | Declarative, responsive React SVG charting library |
| **Testing** | Vitest 5.x | High-performance native TypeScript test runner |

---

## Prerequisites

- **Node.js:** `>= 20.9.0` (Recommended: Node 22+)
- **PostgreSQL:** `>= 14.0` (Local installation or hosted instance)
- **Package Manager:** `npm`

---

## Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | Primary PostgreSQL connection string for development and production. | `postgresql://postgres:password@localhost:5432/acme_salary` |
| `TEST_DATABASE_URL` | **Yes (for tests)** | Dedicated test database connection string. Mandatory for running Vitest integration tests to protect development seed data. | `postgresql://postgres:password@localhost:5432/acme_salary_test` |

> **Security Guard:** Never commit `.env` to Git. Database credentials must never be prefixed with `NEXT_PUBLIC_` or exposed to the client.

---

## Local Setup & Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Local PostgreSQL Databases
Create the development and test databases:

```bash
# Development Database
createdb acme_salary

# Dedicated Test Database
createdb acme_salary_test
```

*(Alternatively, run `CREATE DATABASE acme_salary;` and `CREATE DATABASE acme_salary_test;` in `psql`).*

### 3. Configure `.env`
Update `.env` with your PostgreSQL username and password:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/acme_salary
TEST_DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/acme_salary_test
```

### 4. Run Migrations & Seed Dataset
```bash
# Apply schema to development database
npm run db:migrate

# Populate with 10,000 deterministic synthetic employees
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Migrations & Seeding

- **Run Pending Migrations:**
  ```bash
  npm run db:migrate
  ```
- **Generate New Migration SQL:**
  ```bash
  npm run db:generate
  ```
- **Seed 10,000 Employees:**
  ```bash
  npm run db:seed
  ```
  - **Dataset Characteristics:** Generates exactly 10,000 synthetic records with realistic salary ranges across 7 countries:
    - United States (`USD`: $55,000–$185,000)
    - United Kingdom (`GBP`: £42,000–£135,000)
    - Germany (`EUR`: €48,000–€145,000)
    - India (`INR`: ₹750,000–₹3,800,000)
    - Canada (`CAD`: $62,000–$175,000)
    - Australia (`AUD`: $68,000–$180,000)
    - Japan (`JPY`: ¥5,200,000–¥16,500,000)
  - **Reset Strategy:** The script executes `TRUNCATE TABLE employees RESTART IDENTITY CASCADE;` before insertion, guaranteeing exactly 10,000 records without duplicate key collisions or bloated data upon rerun.
  - **Batch Insertion:** Inserts records in chunks of 500 rows to ensure optimal execution time (~3 seconds).
- **Inspect Database with Drizzle Studio:**
  ```bash
  npm run db:studio
  ```

---

## Running Integration Tests

Integration tests run using **Vitest** against actual database instances to verify SQL parameterization, indexing, constraints, and statistical calculations:

### 1. Apply Migrations to Test Database
Before running tests for the first time, ensure the test database schema is up-to-date:

```bash
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/acme_salary_test npm run db:migrate
```

### 2. Run Test Suite
```bash
npm test
```

For interactive watch mode:
```bash
npm run test:watch
```

### Database Isolation Guard
- **Mandatory `TEST_DATABASE_URL`:** The test runner (`tests/setup.ts`) immediately aborts if `TEST_DATABASE_URL` is missing.
- **Anti-Collusion Target Check:** The test runner parses host, port, and database name from both URLs. If `TEST_DATABASE_URL` and `DATABASE_URL` resolve to the same database (normalizing `localhost` and `127.0.0.1`), tests are immediately halted to prevent modifying or deleting the 10,000 development employees.
- **Fixture Isolation:** All test fixtures use the prefix `TEST-` (e.g., `TEST-ACM-CREATE-01`). The test teardown deletes only records matching `where(like(employees.employeeCode, 'TEST-%'))`.

---

## REST API Reference

All endpoints return structured JSON and standard HTTP status codes. Errors follow the uniform envelope: `{ error: string, details?: unknown }`.

### 1. System Health Check
- **Endpoint:** `GET /api/health`
- **Description:** Executes `SELECT 1;` against PostgreSQL to verify connectivity without leaking internal credentials.
- **Responses:**
  - `200 OK`: `{"status": "healthy", "database": "connected", "timestamp": "..."}`
  - `503 Service Unavailable`: `{"status": "unhealthy", "database": "disconnected", "timestamp": "..."}`

### 2. Employee Directory
- **Endpoint:** `GET /api/employees`
- **Query Parameters:**
  - `page` *(optional, integer, default: 1)*
  - `pageSize` *(optional, integer, min: 1, max: 100, default: 20)*
  - `search` *(optional, string)*: Case-insensitive search on code, name, or email.
  - `country` *(optional, string)*: Exact match filter.
  - `department` *(optional, string)*: Exact match filter.
  - `sortBy` *(optional, enum: firstName, lastName, employeeCode, salaryAmount, country, department, createdAt)*.
  - `sortOrder` *(optional, enum: asc, desc, default: desc)*.
- **Response:** `200 OK`
  ```json
  {
    "data": [
      {
        "id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
        "employeeCode": "ACM-00001",
        "firstName": "Alex",
        "lastName": "Smith",
        "email": "alex.smith.1@acme-corp.synthetic",
        "country": "United States",
        "department": "Engineering",
        "jobTitle": "Software Engineer",
        "salaryAmount": "125000.00",
        "currency": "USD",
        "createdAt": "2026-11-19T00:00:00.000Z",
        "updatedAt": "2026-11-19T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 10000,
      "page": 1,
      "pageSize": 20,
      "totalPages": 500
    }
  }
  ```

### 3. Create Employee
- **Endpoint:** `POST /api/employees`
- **Request Body:**
  ```json
  {
    "employeeCode": "ACM-10001",
    "firstName": "Taylor",
    "lastName": "Morgan",
    "email": "taylor.morgan@acme-corp.synthetic",
    "country": "Canada",
    "department": "Product",
    "jobTitle": "Senior Product Manager",
    "salaryAmount": "135000.00",
    "currency": "CAD"
  }
  ```
- **Responses:**
  - `201 Created`: `{"message": "Employee created successfully", "data": {...}}`
  - `400 Bad Request`: Input validation failed (invalid email, non-positive salary, invalid currency).
  - `409 Conflict`: Duplicate employee code or email address.

### 4. Get Employee by ID
- **Endpoint:** `GET /api/employees/[id]`
- **Responses:**
  - `200 OK`: `{"data": {...}}`
  - `400 Bad Request`: Invalid UUID format.
  - `404 Not Found`: Employee does not exist.

### 5. Update Employee
- **Endpoint:** `PATCH /api/employees/[id]`
- **Request Body:** Partial object containing any updatable fields.
- **Responses:**
  - `200 OK`: `{"message": "Employee updated successfully", "data": {...}}`
  - `400 Bad Request`: Validation failure.
  - `404 Not Found`: Employee not found.
  - `409 Conflict`: Updated code or email collides with another record.

### 6. Delete Employee
- **Endpoint:** `DELETE /api/employees/[id]`
- **Responses:**
  - `200 OK`: `{"message": "Employee deleted successfully", "data": {...}}`
  - `404 Not Found`: Employee not found.

### 7. Payroll Analytics
- **Endpoint:** `GET /api/analytics/payroll`
- **Description:** Computes global headcount, currency breakdowns, country summaries, and department benchmarks using SQL aggregations.
- **Response:** `200 OK`
  ```json
  {
    "totalEmployees": 10000,
    "byCurrency": [
      {
        "currency": "USD",
        "employeeCount": 1429,
        "totalPayroll": "171480000.00",
        "averageSalary": "120000.00",
        "medianSalary": "119850.50"
      }
    ],
    "byCountry": [...],
    "byDepartment": [...]
  }
  ```

---

## Vercel Deployment Guide

Deploying Next.js on Vercel requires connecting to a **cloud-hosted PostgreSQL database** (e.g., [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)).

> **Critical Architecture Rule:** Vercel serverless functions run in ephemeral cloud containers and **cannot** connect to `localhost:5432` or your local machine's PostgreSQL database. You must use a hosted PostgreSQL instance with public or connection-pooled connection strings.

### 1. Provision a Cloud PostgreSQL Database
1. Create a PostgreSQL database on Neon, Supabase, or Railway.
2. Obtain the pooled connection string with SSL enabled:
   ```text
   postgresql://user:password@ep-cool-fog-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Apply Migrations to Hosted Database
From your local terminal, apply the Drizzle schema directly to the cloud database:

```bash
DATABASE_URL="postgresql://user:password@hosted-db.com/neondb?sslmode=require" npm run db:migrate
```

*(Optional) Seed the 10,000 synthetic employees to the hosted database:*
```bash
DATABASE_URL="postgresql://user:password@hosted-db.com/neondb?sslmode=require" npm run db:seed
```

### 3. Deploy to Vercel

#### Option A: Via GitHub Integration
1. Push your repository to GitHub.
2. Import the project in your [Vercel Dashboard](https://vercel.com/new).
3. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your hosted PostgreSQL connection string (`postgresql://...?sslmode=require`).
4. Click **Deploy**.

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI if needed
npm install -g vercel

# Deploy
vercel

# Set Production Environment Variable
vercel env add DATABASE_URL production
# Paste your hosted PostgreSQL connection string

# Deploy to production
vercel --prod
```

### 4. Verify Cloud Deployment
1. Visit `https://your-deployment.vercel.app/api/health` to confirm database connectivity returns `status: healthy`.
2. Open `https://your-deployment.vercel.app` to explore the directory and payroll dashboard.

---

## Demonstration & Reviewer Walkthrough

Follow this step-by-step walkthrough to evaluate the application's core requirements:

### Step 1: Browse 10,000 Employees with Server-Side Pagination
1. Open the homepage at `http://localhost:3000`.
2. Observe the total headcount badge displaying **10,000** employees.
3. Scroll to the bottom pagination bar: notice it displays `Showing 1 to 20 of 10,000 employees` across `500` pages.
4. Click **Next** (`>`) to paginate to Page 2. Notice immediate sub-second page transitions powered by database `LIMIT` and `OFFSET`.
5. Switch **Rows per page** from `20` to `50`. Observe the table dynamically adjust to 50 rows per page.

### Step 2: Instant Multi-Column Search & Filters
1. In the search input, type a last name (e.g. `Gruber` or `Smith`).
2. Notice the table filters in under 300ms using server-side SQL `ILIKE`.
3. In the **Country** dropdown, select `Germany`.
4. In the **Department** dropdown, select `Engineering`.
5. Observe the table update to display only German engineering staff.
6. Click the **Reset** button to immediately restore the global view.

### Step 3: View Employee Profile (Details Modal)
1. Click the **Eye icon** (`View Details`) on any employee row.
2. Observe the modal showing employee code, full name, email, department, job title, and country.
3. Inspect the **Annual Compensation card**: notice the currency is explicitly highlighted (`USD`, `EUR`, etc.) and accompanied by the ACME policy disclaimer:
   *Compensation is denominated in local currency. ACME strict policy prohibits cross-currency direct comparison without normalized FX spot calculations.*
4. Click **Close**.

### Step 4: Employee Creation with Strict Validation & Conflict Guard
1. Click **+ Add Employee** in the top header.
2. Click **Create Employee** with empty fields: observe inline field errors (`Employee code is required`, `Valid email is required`, etc.).
3. Fill in the form with valid details:
   - **Employee Code:** `ACM-99991`
   - **First Name:** `Ada`
   - **Last Name:** `Lovelace`
   - **Email:** `ada.lovelace@acme-corp.synthetic`
   - **Country:** `United Kingdom` (notice currency defaults to `GBP`)
   - **Department:** `Engineering`
   - **Job Title:** `Chief Architect`
   - **Salary Amount:** `165000.00`
4. Submit the form: observe the modal close and the table update.
5. Reopen **+ Add Employee** and enter `ACM-99991` with a different email. Submit the form: observe the red conflict banner:
   *Employee code 'ACM-99991' is already registered* (HTTP 409 Conflict).

### Step 5: Employee Update & Safe Deletion
1. In the search bar, search `ACM-99991` to locate Ada Lovelace.
2. Click the **Pencil icon** (`Edit Employee`).
3. Change the salary to `175000.00` and submit.
4. Click the **Trash icon** (`Delete Employee`).
5. Observe the confirmation dialog showing employee name and code.
6. Confirm deletion: notice the record is immediately removed and disappears from the directory.

### Step 6: Payroll Insights Dashboard
1. Click **Payroll Insights** in the top navigation bar (`/analytics`).
2. Notice the **Financial Integrity Alert Banner** emphasizing strict currency segregation.
3. Review the **Summary Metric Cards**:
   - Total Workforce Headcount: `10,000`
   - Operating Currencies: `7`
   - Individual Currency Cards: Observe total payroll, headcount, average salary, and continuous median salary calculated separately for each currency (`USD`, `GBP`, `EUR`, `INR`, `CAD`, `AUD`, `JPY`).
4. Inspect the **Department Benchmark Chart**:
   - Notice the chart shows **Average vs. Median** salaries per department.
   - Use the **View Currency dropdown** to switch between `USD`, `EUR`, `GBP`, and `INR`.
   - Observe how the vertical Y-axis and bars re-scale strictly within the selected currency, preventing misleading cross-currency comparison.
5. Inspect the **Country-Wise and Department-Wise Tables**:
   - Observe full statistical breakdowns with explicit currency badges on every row.

### Step 7: System Health & Precision Verification
1. Open `http://localhost:3000/api/health` in your browser.
2. Verify response: `{"status": "healthy", "database": "connected", "timestamp": "..."}`.

---

## Available npm Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server on `localhost:3000` |
| `npm run build` | Compiles and builds production-ready Next.js application |
| `npm run start` | Launches production Next.js server |
| `npm run lint` | Runs ESLint analysis |
| `npm run typecheck` | Validates strict TypeScript compilation without emitting files |
| `npm test` | Runs Vitest backend integration test suite |
| `npm run test:watch` | Runs Vitest in interactive watch mode |
| `npm run db:generate` | Generates Drizzle migration files from `src/lib/db/schema.ts` |
| `npm run db:migrate` | Applies pending SQL migrations to PostgreSQL |
| `npm run db:seed` | Seeds database with 10,000 deterministic synthetic employees |
| `npm run db:studio` | Launches Drizzle Studio web interface for database inspection |

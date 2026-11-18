# Implementation Plan: ACME Employee Salary Management System

This document outlines the nine sequential milestones for implementing the ACME Employee Salary Management System. Each milestone corresponds to an incremental, logical stage of development.

> **Note:** Implementation of milestones 2 through 9 will only proceed upon explicit instruction. Never commit or push without explicit human approval.

---

### Milestone 1: `docs: add requirements and technical decisions`
- **Objective:** Establish the technical foundation, architectural rules, engineering standards, and scope boundaries for the project.
- **Expected Implementation:**
  - Create root `AGENTS.md` containing all project rules, technology locks, and constraints.
  - Create `artifacts/requirements.md` covering scope, user stories, currency rules, and acceptance criteria.
  - Create `artifacts/architecture.md` detailing the layered architecture and Mermaid diagram.
  - Create `artifacts/technical-decisions.md` documenting rationale behind the tech stack, currency rules, and decimal storage.
  - Create `artifacts/implementation-plan.md` defining all 9 milestones.
  - Create `artifacts/ai-development-log.md` establishing the AI audit trail.
- **Completion Criteria:** All specification documents created, thoroughly reviewed, and aligned with project constraints without any application code or packages installed.

---

### Milestone 2: `chore: initialize Next.js and database configuration`
- **Objective:** Scaffold the Next.js App Router application with TypeScript, Tailwind CSS, shadcn/ui foundation, and Drizzle ORM configuration.
- **Expected Implementation:**
  - Initialize Next.js App Router project with TypeScript and ESLint.
  - Configure Tailwind CSS and essential utility helpers (`cn` helper).
  - Install and configure Drizzle ORM, `drizzle-kit`, and `pg` / `@neondatabase/serverless` client.
  - Create database client singleton in `lib/db/index.ts`.
  - Provide `.env.example` with local PostgreSQL connection parameters.
- **Completion Criteria:** Next.js development server runs cleanly (`npm run dev`), TypeScript compiles without errors, and database connection setup is verified.

---

### Milestone 3: `feat: add employee schema and deterministic 10k seed`
- **Objective:** Define the employee table schema with Drizzle and implement a deterministic seed generator for 10,000 synthetic employee records.
- **Expected Implementation:**
  - Define `employees` schema in `lib/db/schema.ts` with columns: `id` (UUID/serial), `firstName`, `lastName`, `email`, `department`, `country`, `currency`, `salary` (`numeric(12, 2)`), `createdAt`, `updatedAt`.
  - Add database indexes on `country`, `department`, and `(lastName, firstName)`.
  - Generate Drizzle migrations and apply them to local PostgreSQL.
  - Build a deterministic seed script (`scripts/seed.ts`) generating 10,000 realistic records with pseudo-random generation (fixed seed) across countries (e.g., US, UK, DE, IN, CA) and paired currencies (USD, GBP, EUR, INR, CAD).
- **Completion Criteria:** Migration creates table and indexes; seed script inserts 10,000 rows in under 15 seconds; queries confirm exact row count.

---

### Milestone 4: `feat: implement employee CRUD and filtering APIs`
- **Objective:** Build robust, type-safe Next.js Route Handlers for managing employee records with server-side pagination, search, and filtering.
- **Expected Implementation:**
  - Define Zod request/response schemas in `lib/validations/employee.ts`.
  - Create service layer `lib/services/employee-service.ts` decoupling business queries from HTTP handlers.
  - Implement `GET /api/employees`: handles `page`, `pageSize`, `search`, `country`, `department`, and `sortBy`.
  - Implement `POST /api/employees`: validates payload and inserts a new employee.
  - Implement `PUT /api/employees/[id]`: validates payload and updates existing record.
  - Implement `DELETE /api/employees/[id]`: deletes specified employee record.
- **Completion Criteria:** All endpoints return proper HTTP statuses; pagination and filtering execute strictly via SQL `LIMIT`, `OFFSET`, and `WHERE`; invalid inputs return structured `400` validation errors.

---

### Milestone 5: `feat: implement payroll analytics`
- **Objective:** Create analytics service and route handlers to compute global compensation metrics and distributions.
- **Expected Implementation:**
  - Create `lib/services/analytics-service.ts` executing SQL aggregate queries.
  - Implement `GET /api/analytics/payroll`:
    - Overall summary metrics (total headcount, currency-segregated total payroll).
    - Country-wise summaries: headcount, total salary, average salary, median salary grouped by currency.
    - Department-wise summaries: headcount, total salary, average salary, median salary grouped by currency.
    - Calculate exact median using PostgreSQL `percentile_cont(0.5) WITHIN GROUP (ORDER BY salary)`.
- **Completion Criteria:** Analytics queries execute in under 500ms over 10,000 rows; absolutely zero cross-currency addition; results verified against database calculations.

---

### Milestone 6: `feat: build employee management interface`
- **Objective:** Create the interactive employee directory user interface with search, filters, pagination, and modal dialogs for CRUD operations.
- **Expected Implementation:**
  - Build responsive employee directory table component.
  - Implement debounced search input (name/email).
  - Add country and department filter dropdowns.
  - Add server-side pagination controls (Previous, Next, Page Jump, Page Size).
  - Build Create Employee modal dialog with client-side Zod validation.
  - Build Edit Employee modal dialog with pre-filled state.
  - Build Delete Employee confirmation dialog.
  - Provide user feedback (toast/alert) on successful mutations or API errors.
- **Completion Criteria:** User can smoothly search, filter, paginate, create, edit, and delete employee records with immediate visual updates and responsive layout.

---

### Milestone 7: `feat: build payroll insights dashboard`
- **Objective:** Build the payroll insights dashboard visualizing key compensation metrics and distributions.
- **Expected Implementation:**
  - Summary metric cards for total headcount and total payroll broken down per currency.
  - Country-wise compensation breakdown table and Recharts bar chart.
  - Department-wise compensation breakdown chart.
  - Statistical comparison view showing Average vs. Median salaries per department and country.
  - Strict UI grouping ensuring currencies are never visually merged into one sum.
- **Completion Criteria:** Dashboard loads analytics cleanly, charts render responsively, currency separation is clearly legible, and data accurately reflects database state.

---

### Milestone 8: `test: cover employee and analytics business logic`
- **Objective:** Implement comprehensive unit and integration tests using Vitest covering domain validation, filtering logic, and payroll calculation logic.
- **Expected Implementation:**
  - Configure Vitest in `vitest.config.ts`.
  - Write validation unit tests for Zod employee schemas (valid inputs, negative salaries, malformed emails).
  - Write service unit tests for query builder logic, pagination limits, and sorting constraints.
  - Write analytics unit tests verifying median and average aggregation logic and strict currency grouping invariants using isolated mock fixtures (no dependency on 10k seed).
- **Completion Criteria:** `npm run test` executes all test suites deterministically and passes with 100% success.

---

### Milestone 9: `docs: add setup, deployment, and demo instructions`
- **Objective:** Provide clear, production-grade documentation for setting up, running, testing, and deploying the application.
- **Expected Implementation:**
  - Complete `README.md` with project overview, architecture summary, and prerequisites.
  - Step-by-step local setup guide (Node.js version, local PostgreSQL, `.env` setup, migrations, seed command, dev server).
  - Deployment instructions for Next.js on Vercel paired with hosted PostgreSQL (Neon / Supabase / Railway).
  - Step-by-step evaluation/demo script covering the user stories.
- **Completion Criteria:** Clean repository clone can be set up, migrated, seeded, and tested by an external reviewer relying solely on the instructions.

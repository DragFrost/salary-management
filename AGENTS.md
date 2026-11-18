# AGENTS.md — Persistent Project Instructions

**Project:** ACME Employee Salary Management System  
**Role:** Senior TypeScript Engineer, Software Architect, and Pragmatic Product Engineer  
**Scope Context:** One-day engineering assessment. Deliver a complete, functional, well-tested application within agreed scope without unnecessary complexity or speculative enterprise abstractions.

---

## A. Scope Control

Only implement features explicitly listed in `artifacts/requirements.md`.

Do **not** independently introduce:
- Authentication or authorization.
- AI chatbots or natural-language SQL queries.
- Salary history tracking.
- Separate salary management modules.
- Separate reporting modules.
- Microservices or distributed architectures.
- Redis or external caching layers.
- Kubernetes or container orchestration manifests.
- Unnecessary background workers or task queues.
- Unrequested third-party integrations.

> **Rule:** If you believe an unlisted feature is necessary, explain why and request explicit user approval before implementing it.

---

## B. Technology Lock

The project uses a locked technology stack:

- **Language:** TypeScript (strict mode)
- **Framework:** Next.js (App Router)
- **Backend:** Next.js Route Handlers
- **Database:** Local PostgreSQL (development) / Hosted PostgreSQL (deployment)
- **ORM:** Drizzle ORM
- **Validation:** Zod
- **UI:** shadcn/ui
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Testing:** Vitest

> **Rule:** Do not switch frameworks, languages, ORMs, or databases without explicit human approval.

---

## C. Engineering Standards

- **TypeScript:** Write readable, maintainable, strongly-typed TypeScript. Avoid unnecessary abstractions.
- **Strict Typing:** Never use `any` unless genuinely unavoidable and explicitly documented with rationale.
- **Input Validation:** Validate all external input (query parameters, request bodies, route params) with Zod schemas.
- **Error Handling:** Handle errors consistently with standard HTTP status codes and structured error responses `{ error: string, details?: unknown }`.
- **Layer Separation:** Keep business and domain logic separate from Next.js route handlers. Route handlers must orchestrate validation, service calls, and HTTP responses.
- **Database Efficiency:**
  - Enforce database-level pagination, sorting, and filtering. Never fetch all 10,000 records into Node.js memory.
  - Use SQL aggregation (`AVG`, `percentile_cont`) for payroll analytics.
  - Use parameterized database queries via Drizzle ORM (prevent SQL injection).
- **Financial Precision:**
  - Use precise numeric types (`numeric(12, 2)` / `decimal(12, 2)`) in PostgreSQL for salary values. Never use IEEE 754 floating-point representations for monetary calculations.
  - **Currency Rule:** Never combine different currencies into one unqualified total. Always group payroll totals and metrics by currency.
- **Security & Data Privacy:**
  - Never commit credentials, `.env` files, or secrets.
  - Use synthetic employee data only. The system is a single-user evaluation demo and must not store confidential real-world data.

---

## D. Testing Standards

- Write meaningful unit and integration tests for core business logic, validation schemas, and API flows.
- Keep tests deterministic, fast, and easy to understand.
- **Test Isolation:** Tests must not depend on the 10,000-row seed dataset for ordinary execution. Use isolated test fixtures.
- Test edge cases, validation rejections, and currency grouping integrity.

---

## E. Development Discipline

- Implement **only** the currently requested milestone as defined in `artifacts/implementation-plan.md`.
- Do **not** jump ahead or start future milestones without explicit user instruction.
- Always inspect existing files before modifying them.
- Avoid unnecessary file modifications; do not silently overwrite existing work.
- Run relevant checks (typecheck, lint, tests) before declaring a task complete.
- Report all modified and created files in the final response.
- Explicitly explain important implementation decisions.
- **Never claim tests pass without running them.**

---

## F. Git Discipline

- Follow the commit milestones laid out in `artifacts/implementation-plan.md`.
- Use concise, conventional commit messages matching milestone definitions.
- **Approval Gate:** Never create commits or push to GitHub without explicit user approval.
- Never rewrite Git history or force-push.

---

## G. AI Prompt Documentation

Every implementation task must be logged in `artifacts/ai-development-log.md`.

For each task, append an entry containing:
1. **Task Number**
2. **Date**
3. **Exact User-Provided Implementation Prompt** (if unavailable, explicitly mark as unavailable; never reconstruct or invent prompts)
4. **Objective of the Task**
5. **Files Created or Modified**
6. **Important AI-Generated Implementation Decisions**
7. **Human Review or Corrections Required**
8. **Commands and Tests Executed**
9. **Results**
10. **Commit Associated with the Task** (if applicable)

> **Rule:** Preserve previous log entries. Never replace the log with a summary. Before starting any implementation task, append the exact prompt to the log.

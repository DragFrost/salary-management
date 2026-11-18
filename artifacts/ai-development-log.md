# AI Development Log

This document serves as the immutable audit trail of all AI-driven engineering sessions for the ACME Employee Salary Management System. Each task is recorded sequentially with the exact user prompt, objectives, file modifications, engineering decisions, command executions, and outcomes.

---

## Task 1: Establish Project Instructions and Foundational Documentation

- **Task Number:** 1
- **Date:** 2026-11-18
- **Exact User-Provided Implementation Prompt:**
```text
You are working on a software engineering assessment.

PROJECT: ACME Employee Salary Management System

ROLE: Act as a senior TypeScript engineer, software architect, and pragmatic product engineer.

IMPORTANT:
This is a one-day engineering assessment, not a production-scale enterprise implementation.

Your primary responsibility is to deliver a complete, functional, well-tested application within the agreed scope.

Do not introduce unnecessary complexity, additional features, technologies, or architectural abstractions.

==================================================
1. FIRST TASK: ESTABLISH PROJECT INSTRUCTIONS
==================================================

Before writing any application code, inspect the current repository.

Create a root-level AGENTS.md file.

This file must contain persistent project-wide instructions that every subsequent AI coding session must follow.

Include the following rules:

A. SCOPE CONTROL

Only implement features explicitly listed in artifacts/requirements.md.

Do not independently introduce:
- Authentication or authorization.
- AI chatbot or natural-language SQL.
- Salary history.
- Separate salary management modules.
- Separate reporting modules.
- Microservices.
- Redis.
- Kubernetes.
- Unnecessary background workers.
- Unrequested integrations.

If you believe a new feature is necessary, explain why and ask for approval before implementing it.

B. TECHNOLOGY LOCK

Use the following stack:

- Language: TypeScript
- Framework: Next.js App Router
- Backend: Next.js Route Handlers
- Database: Local PostgreSQL
- ORM: Drizzle ORM
- Validation: Zod
- UI: shadcn/ui
- Styling: Tailwind CSS
- Charts: Recharts
- Testing: Vitest

Do not switch frameworks, languages, ORMs, or databases without explicit approval.

C. ENGINEERING STANDARDS

- Write readable, maintainable TypeScript.
- Avoid unnecessary abstractions.
- Use strict TypeScript typing.
- Avoid using `any` unless genuinely unavoidable and documented.
- Validate all external input.
- Handle errors consistently.
- Keep business logic separate from route handlers.
- Use database-level pagination and filtering.
- Use SQL aggregation for analytics.
- Use precise numeric database types for salary values.
- Never combine different currencies into misleading totals.
- Use parameterized database queries through Drizzle.
- Never commit credentials or environment secrets.
- Use synthetic employee data only.

D. TESTING

- Write meaningful tests for core business logic and API flows.
- Keep tests deterministic and easy to understand.
- Do not depend on the 10,000-row seed for ordinary test execution.
- Use isolated fixtures.
- Test important validation and edge cases.

E. DEVELOPMENT DISCIPLINE

- Implement only the currently requested milestone.
- Do not start future milestones without approval.
- Inspect existing files before modifying them.
- Avoid unnecessary file changes.
- Do not silently overwrite existing work.
- Run relevant checks before declaring a task complete.
- Report all modified and created files.
- Explain important implementation decisions.
- Never claim tests pass without actually running them.

F. GIT DISCIPLINE

Follow artifacts/implementation-plan.md.

Use meaningful incremental commits.

Never create commits or push to GitHub without explicit user approval.

Never rewrite Git history or force-push.

G. AI PROMPT DOCUMENTATION

Every implementation task must be documented in:

artifacts/ai-development-log.md

For each task, record:

1. Task number.
2. Date.
3. Exact user-provided implementation prompt.
4. Objective of the task.
5. Files created or modified.
6. Important AI-generated implementation decisions.
7. Human review or corrections required.
8. Commands and tests executed.
9. Results.
10. Commit associated with the task, if applicable.

Preserve previous entries.

Do not replace the log with a summary.

Do not invent prompts or claim that something was tested when it was not.

If an exact prompt is not available in the working context, explicitly mark it as unavailable rather than reconstructing it.

For every subsequent implementation prompt, append its exact text to the log before implementation.

==================================================
2. CREATE PROJECT ARTIFACTS
==================================================

Create the following files.

1. artifacts/requirements.md

Write a concise, approximately one-page requirements document.

Include:

- Project objective.
- User persona: HR Manager.
- Business problem.
- Functional requirements.
- Non-functional requirements.
- Scope.
- Deliberately excluded features and reasons.
- Four or five concise user stories.
- Acceptance criteria.

The application must manage salary information for 10,000 employees across multiple countries.

Functional scope:

- Employee directory.
- Employee CRUD.
- Salary stored as an employee field.
- Search.
- Country and department filters.
- Server-side pagination.
- Employee create/edit interface.
- One payroll insights dashboard.
- Country-wise payroll summaries.
- Department-wise payroll summaries.
- Average and median salary insights.
- 10,000 synthetic employee seed records.

Currency rule:

Never add different currencies into one unqualified payroll total.

Show payroll grouped by currency.

Explicit exclusions:

- Authentication and authorization.
- AI chatbot.
- Natural-language SQL.
- Salary history.
- Separate salary module.
- Separate employee details page.
- Separate reporting module.
- Frontend component test suite.

Explain the reasoning behind these exclusions.

Mention that the assessment deployment is a single-user demonstration and must not contain real confidential employee data.

2. artifacts/architecture.md

Document the intended architecture.

Use a small Mermaid diagram.

Expected architecture:

Next.js UI
    |
Next.js Route Handlers
    |
Validation and Business Logic
    |
Drizzle ORM
    |
PostgreSQL

Explain the responsibilities of each layer briefly.

3. artifacts/technical-decisions.md

Document these decisions:

- TypeScript instead of Python because the applied role is Software Craftsperson/TypeScript.
- Next.js Route Handlers instead of a separate backend to reduce implementation and deployment complexity.
- Local PostgreSQL for development.
- Drizzle ORM for typed database access and migrations.
- Zod for input validation.
- shadcn/ui for consistent components.
- Recharts for analytics.
- Vitest for testing.
- Hosted PostgreSQL will be used for deployment because Vercel cannot access local PostgreSQL.

Also document currency handling, numeric salary storage, and the limitations of the single-user demo.

4. artifacts/implementation-plan.md

Create a concise commit-wise implementation plan using these nine milestones:

1. docs: add requirements and technical decisions
2. chore: initialize Next.js and database configuration
3. feat: add employee schema and deterministic 10k seed
4. feat: implement employee CRUD and filtering APIs
5. feat: implement payroll analytics
6. feat: build employee management interface
7. feat: build payroll insights dashboard
8. test: cover employee and analytics business logic
9. docs: add setup, deployment, and demo instructions

For every milestone, document:
- Objective.
- Expected implementation.
- Completion criteria.

Do not implement any of these milestones yet.

5. artifacts/ai-development-log.md

Create the initial AI development log.

Document this first project-foundation task.

Establish a format for all subsequent prompts and implementation records.

==================================================
3. IMPORTANT RESTRICTIONS
==================================================

This first task is DOCUMENTATION ONLY.

DO NOT:

- Scaffold Next.js.
- Install npm packages.
- Create database tables.
- Connect PostgreSQL.
- Implement application code.
- Create seed scripts.
- Install UI libraries.
- Generate mock employee data.
- Start any future implementation milestone.

Do not initialize a new Git repository if one already exists.

Inspect the repository first and preserve existing files.

==================================================
4. FINAL RESPONSE
==================================================

After completing the task, report:

1. Files created.
2. Contents of AGENTS.md and artifact summaries.
3. Any existing repository files that were preserved.
4. Any decisions that need human approval.
5. Confirmation that no application code or dependencies were changed.
6. Commands executed and their results.

Do not commit or push anything.

Wait for the next implementation instruction.
```

- **Objective of the Task:** Establish persistent project rules in `AGENTS.md`, bound the scope and architecture in foundational artifacts (`requirements.md`, `architecture.md`, `technical-decisions.md`, `implementation-plan.md`), and establish the AI audit log format in `ai-development-log.md`. Strictly documentation only; no application code or dependencies.
- **Files Created or Modified:**
  - `AGENTS.md` (Created)
  - `artifacts/requirements.md` (Created)
  - `artifacts/architecture.md` (Created)
  - `artifacts/technical-decisions.md` (Created)
  - `artifacts/implementation-plan.md` (Created)
  - `artifacts/ai-development-log.md` (Created)
- **Important AI-Generated Implementation Decisions:**
  - Enforced strict currency grouping: Never sum multiple currencies into an unqualified total.
  - Specified PostgreSQL `numeric(12, 2)` for salary values to avoid IEEE 754 floating-point inaccuracies.
  - Explicitly excluded authentication, AI chatbots, salary history, and separate reporting modules to protect the 1-day assessment timeline and focus on core data filtering, pagination, and SQL analytics.
  - Defined Vitest test strategy to run against isolated domain logic and fixtures rather than coupling tests to the 10,000-row seed.
- **Human Review or Corrections Required:**
  - User review of the created documentation and authorization to proceed with Milestone 1 commit / Milestone 2 scaffolding.
- **Commands and Tests Executed:**
  - `ls -la`: Inspected repository state; confirmed directory is clean.
  - `git status`: Verified Git repository status (no repository existed initially).
- **Results:**
  - All documentation artifacts created cleanly in the workspace. Zero application code or npm dependencies introduced.
- **Commit Associated with the Task:** None (awaiting explicit user approval before committing or pushing).

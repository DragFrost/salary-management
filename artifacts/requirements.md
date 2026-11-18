# Requirements Specification: ACME Employee Salary Management System

## 1. Project Objective
Build a lightweight, highly responsive, and functionally complete web application enabling Human Resources managers at ACME Corp to manage global employee records and analyze compensation distributions across 10,000 employees in multiple countries.

## 2. User Persona
- **Primary Persona:** HR Manager (Global Operations & Compensation)
- **Context:** Responsible for employee onboarding, compensation updates, and high-level compensation reviews across international offices. Needs fast access to employee records without latency and accurate payroll aggregates without cross-currency distortion.

## 3. Business Problem
ACME Corp operates globally across multiple countries with distinct currencies. Compensation data is frequently fragmented, making it difficult to:
- Quickly search and filter employee profiles across a 10,000-person workforce.
- Maintain accurate salary and department records in a unified interface.
- Understand payroll commitments per country and department without manually normalizing or incorrectly summing incompatible local currencies.

## 4. Scope of the System

### In-Scope Functional Requirements
1. **Employee Directory:** Paginated table listing employees with name, email, department, country, currency, and annual salary.
2. **Server-Side Pagination & Filtering:**
   - Database-level pagination (configurable page size, e.g., 20 or 50 items per page).
   - Text search on employee name and email.
   - Exact-match dropdown filters for `Country` and `Department`.
3. **Employee CRUD:**
   - Create new employee records with validated inputs.
   - Read employee details in directory table.
   - Update existing employee details (department, salary, country, currency).
   - Delete employee records with confirmation.
4. **Integrated Salary Model:** Salary is stored directly as an attribute of the employee record (precise numeric representation), avoiding unnecessary relational overhead for this assessment.
5. **Payroll Insights Dashboard:**
   - Total employee headcount.
   - Country-wise payroll breakdown (headcount, total salary per currency).
   - Department-wise payroll breakdown (headcount, total salary per currency).
   - Average and median salary metrics calculated via server-side SQL aggregations.
6. **Synthetic Seed Data:** Deterministic database seed generating 10,000 realistic international employee records across defined countries and departments.

### Currency Integrity Rule
> **Strict Rule:** Never sum or combine different currencies into an unqualified aggregate total. All payroll totals, averages, and medians must be grouped and presented strictly by currency (e.g., USD, EUR, GBP, INR, CAD).

### Deliberately Excluded Features & Rationale
- **Authentication & Authorization:** Excluded to preserve focus on data modeling, performant filtering over 10,000 rows, and analytical SQL aggregations. Single-user assessment demonstration only.
- **AI Chatbots / Natural-Language SQL:** Excluded to avoid hallucinations in financial summaries, unnecessary token costs, and scope bloat.
- **Salary History / Auditing:** Excluded because current compensation state satisfies core HR workflows within the 1-day timeframe.
- **Separate Salary Management Module:** Excluded in favor of an integrated employee field, eliminating multi-table synchronization overhead.
- **Separate Employee Details Page:** Excluded in favor of inline directory actions and modal dialogues for rapid UX.
- **Separate Reporting Module:** Excluded in favor of a single, cohesive Payroll Insights dashboard view.
- **Frontend Component Test Suite:** Excluded in favor of rigorous Vitest unit and integration tests covering business logic, validation, and analytics queries.

## 5. Non-Functional Requirements
- **Performance:** Sub-second response times for paginated directory queries and analytics aggregation over 10,000 rows using database indexing (`B-tree` on filters and search columns).
- **Financial Precision:** Currency values stored using SQL `numeric(12, 2)` to eliminate floating-point arithmetic anomalies.
- **Data Privacy & Compliance:** Strictly synthetic employee data. No real-world confidential personal or financial data.
- **Deployment & Portability:** Single-user web deployment using Next.js App Router and hosted PostgreSQL.

## 6. User Stories
1. **Directory Search:** As an HR Manager, I want to search employees by name or email and filter by country and department, so that I can quickly inspect any individual's record among 10,000 employees.
2. **Record Management:** As an HR Manager, I want to create and update an employee's profile and salary with strict client- and server-side validation, so that employee records remain clean and accurate.
3. **Employee Removal:** As an HR Manager, I want to delete an employee record with a confirmation prompt, so that departed staff are removed without accidental deletions.
4. **Compensation Insights:** As an HR Manager, I want to view payroll summaries and average/median salaries broken down by currency, country, and department, so that I can evaluate compensation trends without mixed-currency distortions.
5. **Seed Initialization:** As an Evaluator, I want to seed 10,000 deterministic synthetic records with a single command, so that I can test performance and analytics under realistic load.

## 7. Acceptance Criteria
- [ ] Directory renders within 1 second for any search, filter, or pagination request against 10,000 rows.
- [ ] Employee creation, update, and deletion immediately reflect in database and UI.
- [ ] Salary cannot be negative or non-numeric; inputs are strictly validated via Zod.
- [ ] Payroll dashboard calculates average and median salaries using SQL aggregations.
- [ ] No dashboard chart or metric combines disparate currencies into an unqualified sum.
- [ ] 10,000 deterministic records seed successfully via automated script.

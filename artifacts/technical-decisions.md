# Technical Decisions: ACME Employee Salary Management System

## 1. Programming Language: TypeScript (vs. Python)
- **Decision:** Use TypeScript across the entire stack.
- **Rationale:** Aligns directly with the target role (Software Craftsperson / TypeScript). TypeScript provides end-to-end type safety spanning the database schema (Drizzle), API contracts (Zod), backend services, and UI components. Eliminates the context-switching and schema duplication inherent in polyglot setups.

## 2. Backend Architecture: Next.js Route Handlers (vs. Separate Node/Express/NestJS Service)
- **Decision:** Implement backend APIs using Next.js App Router Route Handlers (`app/api/*`).
- **Rationale:** A single unified repository and runtime avoids the overhead of managing multiple processes, separate build pipelines, cross-origin resource sharing (CORS) configurations, and separate cloud deployments. Perfect fit for a 1-day assessment without sacrificing clean separation of concerns.

## 3. Database: Local PostgreSQL (Development) & Hosted PostgreSQL (Deployment)
- **Decision:** Use local PostgreSQL for local development and a cloud-hosted PostgreSQL instance (e.g., Neon / Supabase / Railway) for deployment.
- **Rationale:**
  - Vercel serverless deployments cannot connect to local workstation databases (`localhost:5432`). Hosted PostgreSQL provides a globally accessible, secure connection string with connection pooling.
  - PostgreSQL natively supports high-performance aggregation functions required for payroll analytics, notably `percentile_cont(0.5) WITHIN GROUP (ORDER BY salary)` for exact median calculations across 10,000 records.
  - SQLite was rejected because it lacks native median aggregate functions and precision decimal support without external extensions.

## 4. ORM & Query Layer: Drizzle ORM
- **Decision:** Use Drizzle ORM with `drizzle-kit` for migrations.
- **Rationale:** Drizzle provides compile-time TypeScript type safety with zero runtime overhead. Unlike Prisma, Drizzle does not require a heavy C++ query engine binary, yields predictable, inspectable SQL, and seamlessly supports serverless execution environments and raw SQL aggregation expressions.

## 5. Input Validation: Zod
- **Decision:** Use Zod for all external boundary validation (HTTP query parameters and JSON payloads).
- **Rationale:** Provides strict schema validation with automatic TypeScript type inference (`z.infer<typeof schema>`). Prevents invalid data states before requests touch database or domain layers.

## 6. UI Component System: shadcn/ui & Tailwind CSS
- **Decision:** Use shadcn/ui built on Radix UI primitives and styled with Tailwind CSS.
- **Rationale:** Provides accessible, unstyled primitives copied directly into the project repository. Avoids heavy component library bundle sizes and CSS-in-JS runtime penalties, offering complete customization control over tables, modals, and input controls.

## 7. Data Visualization: Recharts
- **Decision:** Use Recharts for payroll distribution and comparison charts.
- **Rationale:** Recharts is a declarative, React-native charting library built on SVG. It seamlessly integrates with Tailwind styling and React state, and reliably handles aggregated categorical data without heavy dependencies.

## 8. Test Runner: Vitest
- **Decision:** Use Vitest for unit and integration testing.
- **Rationale:** Vitest executes TypeScript natively with fast startup times, built-in ESM support, and Jest-compatible assertion syntax. Tests run in an isolated in-memory environment, ideal for fast test execution over pure domain logic and validation schemas.

## 9. Currency Handling & Integrity
- **Decision:** Strict segregation of currencies; zero cross-currency addition.
- **Rationale:** Summing salaries across different currencies (e.g., USD + EUR + INR + GBP) creates mathematically and economically invalid numbers unless pegged against real-time foreign exchange rates. Spot exchange rates fluctuate continuously and introduce volatility and conversion biases. Therefore, all payroll metrics (total payroll, average salary, median salary) are partitioned and aggregated strictly by currency.

## 10. Financial Storage Precision: SQL Numeric / Decimal
- **Decision:** Store salary amounts as `numeric(12, 2)` in PostgreSQL and validate as positive decimals.
- **Rationale:** Binary floating-point types (`float4`, `float8`, JavaScript `number`) suffer from IEEE 754 precision inaccuracies (e.g., `0.1 + 0.2 = 0.30000000000000004`). Storing values as exact 2-decimal numerics ensures precision to the cent across 10,000 employee records and aggregate sums.

## 11. Single-User Demonstration Scope & Limitations
- **Decision:** Single-tenant, single-user demonstration without authentication or authorization.
- **Rationale:** Designed as a focused one-day technical assessment. Omitting session management, OAuth/JWT pipelines, and RBAC guards allows 100% of the engineering effort to be dedicated to data modeling, high-volume server-side pagination, performant filtering, and robust SQL analytics. The system strictly processes synthetic data and must never be used to store real employee PII.

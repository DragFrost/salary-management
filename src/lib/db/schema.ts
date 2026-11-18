import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const employees = pgTable(
  "employees",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    employeeCode: varchar("employee_code", { length: 32 }).notNull().unique(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    country: varchar("country", { length: 100 }).notNull(),
    department: varchar("department", { length: 100 }).notNull(),
    jobTitle: varchar("job_title", { length: 150 }).notNull(),
    salaryAmount: numeric("salary_amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("employees_employee_code_uidx").on(table.employeeCode),
    uniqueIndex("employees_email_uidx").on(table.email),
    index("employees_country_idx").on(table.country),
    index("employees_department_idx").on(table.department),
    index("employees_currency_idx").on(table.currency),
    index("employees_name_idx").on(table.lastName, table.firstName),
  ]
);

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;

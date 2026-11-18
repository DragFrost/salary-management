import { db } from "@/lib/db";
import { employees, type Employee } from "@/lib/db/schema";
import {
  eq,
  ilike,
  or,
  and,
  asc,
  desc,
  count,
  ne,
  type SQL,
} from "drizzle-orm";
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeQueryParams,
} from "@/lib/validations/employee";

export class EmployeeConflictError extends Error {
  constructor(
    message: string,
    public readonly field?: "employeeCode" | "email"
  ) {
    super(message);
    this.name = "EmployeeConflictError";
  }
}

/**
 * Handles PostgreSQL error code 23505 (unique_violation)
 * Converts database-level duplicate key exceptions into typed EmployeeConflictError.
 */
function handleDatabaseConflict(error: unknown): never {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  ) {
    const pgError = error as { constraint?: string; detail?: string };
    const constraint = pgError.constraint?.toLowerCase() ?? "";
    const detail = pgError.detail?.toLowerCase() ?? "";

    if (
      constraint.includes("employee_code") ||
      detail.includes("employee_code")
    ) {
      throw new EmployeeConflictError(
        "An employee with this employee code already exists",
        "employeeCode"
      );
    }

    if (constraint.includes("email") || detail.includes("email")) {
      throw new EmployeeConflictError(
        "An employee with this email address already exists",
        "email"
      );
    }

    throw new EmployeeConflictError(
      "A unique constraint violation occurred: duplicate record"
    );
  }

  throw error;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const employeeService = {
  /**
   * Retrieves paginated employees with server-side search, filtering, and sorting.
   */
  async listEmployees(
    params: EmployeeQueryParams
  ): Promise<PaginatedResult<Employee>> {
    const { page, pageSize, search, country, department, sortBy, sortOrder } =
      params;
    const conditions: SQL[] = [];

    // Search filter across code, first/last name, and email
    if (search && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(employees.employeeCode, searchTerm),
          ilike(employees.firstName, searchTerm),
          ilike(employees.lastName, searchTerm),
          ilike(employees.email, searchTerm)
        )!
      );
    }

    // Exact match filters for country and department
    if (country && country.trim().length > 0) {
      conditions.push(eq(employees.country, country.trim()));
    }

    if (department && department.trim().length > 0) {
      conditions.push(eq(employees.department, department.trim()));
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Determine sorting column
    const sortColumnMap = {
      firstName: employees.firstName,
      lastName: employees.lastName,
      employeeCode: employees.employeeCode,
      email: employees.email,
      salaryAmount: employees.salaryAmount,
      country: employees.country,
      department: employees.department,
      createdAt: employees.createdAt,
    };

    const targetColumn = sortColumnMap[sortBy] ?? employees.createdAt;
    const orderClause =
      sortOrder === "asc" ? asc(targetColumn) : desc(targetColumn);

    // Get total count matching conditions
    const [countRow] = await db
      .select({ total: count() })
      .from(employees)
      .where(whereClause);

    const total = Number(countRow?.total ?? 0);
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;

    // Fetch paginated slice
    const data = await db
      .select()
      .from(employees)
      .where(whereClause)
      .orderBy(orderClause)
      .limit(pageSize)
      .offset(offset);

    return {
      data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  },

  /**
   * Retrieves a single employee record by UUID.
   */
  async getEmployeeById(id: string): Promise<Employee | null> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id))
      .limit(1);

    return employee ?? null;
  },

  /**
   * Creates a new employee with pre-check and database-level unique constraint handling.
   */
  async createEmployee(data: CreateEmployeeInput): Promise<Employee> {
    // Retain existing pre-checks for employee code
    const [existingCode] = await db
      .select({ id: employees.id })
      .from(employees)
      .where(eq(employees.employeeCode, data.employeeCode))
      .limit(1);

    if (existingCode) {
      throw new EmployeeConflictError(
        `Employee code '${data.employeeCode}' is already registered`,
        "employeeCode"
      );
    }

    // Retain existing pre-checks for email
    const [existingEmail] = await db
      .select({ id: employees.id })
      .from(employees)
      .where(eq(employees.email, data.email))
      .limit(1);

    if (existingEmail) {
      throw new EmployeeConflictError(
        `Email address '${data.email}' is already registered`,
        "email"
      );
    }

    try {
      const [created] = await db.insert(employees).values(data).returning();
      return created;
    } catch (error) {
      handleDatabaseConflict(error);
    }
  },

  /**
   * Updates an existing employee with pre-checks and database-level unique constraint handling.
   */
  async updateEmployee(
    id: string,
    data: UpdateEmployeeInput
  ): Promise<Employee | null> {
    const existing = await this.getEmployeeById(id);
    if (!existing) {
      return null;
    }

    // Retain existing pre-check for unique employee code collision
    if (data.employeeCode && data.employeeCode !== existing.employeeCode) {
      const [conflict] = await db
        .select({ id: employees.id })
        .from(employees)
        .where(
          and(
            eq(employees.employeeCode, data.employeeCode),
            ne(employees.id, id)
          )
        )
        .limit(1);

      if (conflict) {
        throw new EmployeeConflictError(
          `Employee code '${data.employeeCode}' is already in use by another record`,
          "employeeCode"
        );
      }
    }

    // Retain existing pre-check for unique email collision
    if (data.email && data.email !== existing.email) {
      const [conflict] = await db
        .select({ id: employees.id })
        .from(employees)
        .where(
          and(eq(employees.email, data.email), ne(employees.id, id))
        )
        .limit(1);

      if (conflict) {
        throw new EmployeeConflictError(
          `Email address '${data.email}' is already in use by another record`,
          "email"
        );
      }
    }

    try {
      const [updated] = await db
        .update(employees)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(employees.id, id))
        .returning();

      return updated;
    } catch (error) {
      handleDatabaseConflict(error);
    }
  },

  /**
   * Deletes an employee by UUID.
   */
  async deleteEmployee(id: string): Promise<Employee | null> {
    const [deleted] = await db
      .delete(employees)
      .where(eq(employees.id, id))
      .returning();

    return deleted ?? null;
  },
};

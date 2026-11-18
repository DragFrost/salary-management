import { NextRequest, NextResponse } from "next/server";
import {
  createEmployeeSchema,
  employeeQuerySchema,
} from "@/lib/validations/employee";
import {
  employeeService,
  EmployeeConflictError,
} from "@/lib/services/employee-service";

/**
 * GET /api/employees
 * Server-side paginated, searchable, and filterable employee directory.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const queryInput = {
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      country: searchParams.get("country") ?? undefined,
      department: searchParams.get("department") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortOrder: searchParams.get("sortOrder") ?? undefined,
    };

    const validation = employeeQuerySchema.safeParse(queryInput);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await employeeService.listEmployees(validation.data);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/employees error:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching employees" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/employees
 * Creates a new employee record with input validation and uniqueness guarantees.
 */
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const validation = createEmployeeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const created = await employeeService.createEmployee(validation.data);
    return NextResponse.json(
      {
        message: "Employee created successfully",
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof EmployeeConflictError) {
      return NextResponse.json(
        {
          error: error.message,
          details: { field: error.field },
        },
        { status: 409 }
      );
    }

    console.error("POST /api/employees error:", error);
    return NextResponse.json(
      { error: "Internal server error while creating employee" },
      { status: 500 }
    );
  }
}

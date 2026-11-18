import { NextRequest, NextResponse } from "next/server";
import {
  employeeIdSchema,
  updateEmployeeSchema,
} from "@/lib/validations/employee";
import {
  employeeService,
  EmployeeConflictError,
} from "@/lib/services/employee-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/employees/[id]
 * Retrieves a single employee record by UUID.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const rawParams = await context.params;
    const paramValidation = employeeIdSchema.safeParse(rawParams);
    if (!paramValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid employee ID parameter",
          details: paramValidation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const employee = await employeeService.getEmployeeById(
      paramValidation.data.id
    );

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: employee }, { status: 200 });
  } catch (error) {
    console.error("GET /api/employees/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching employee" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/employees/[id]
 * Updates fields of an existing employee with partial validation.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const rawParams = await context.params;
    const paramValidation = employeeIdSchema.safeParse(rawParams);
    if (!paramValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid employee ID parameter",
          details: paramValidation.error.flatten(),
        },
        { status: 400 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const bodyValidation = updateEmployeeSchema.safeParse(body);
    if (!bodyValidation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: bodyValidation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const updated = await employeeService.updateEmployee(
      paramValidation.data.id,
      bodyValidation.data
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Employee updated successfully",
        data: updated,
      },
      { status: 200 }
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

    console.error("PATCH /api/employees/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error while updating employee" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/employees/[id]
 * Deletes an employee by UUID.
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const rawParams = await context.params;
    const paramValidation = employeeIdSchema.safeParse(rawParams);
    if (!paramValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid employee ID parameter",
          details: paramValidation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const deleted = await employeeService.deleteEmployee(
      paramValidation.data.id
    );

    if (!deleted) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Employee deleted successfully",
        data: deleted,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/employees/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error while deleting employee" },
      { status: 500 }
    );
  }
}

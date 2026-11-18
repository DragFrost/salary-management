import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  employeeService,
  EmployeeConflictError,
} from "@/lib/services/employee-service";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "@/lib/validations/employee";
import {
  cleanupTestEmployees,
  TEST_CODE_PREFIX,
} from "../fixtures/test-helpers";

describe("Employee CRUD and Filtering Integration Tests", () => {
  beforeAll(async () => {
    await cleanupTestEmployees();
  });

  afterAll(async () => {
    await cleanupTestEmployees();
  });

  // Test 1: Employee creation with valid data
  it("should create an employee with valid data and exact decimal salary", async () => {
    const input = {
      employeeCode: `${TEST_CODE_PREFIX}CREATE-01`,
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe.test@acme-corp.synthetic",
      country: "United States",
      department: "Engineering",
      jobTitle: "Software Architect",
      salaryAmount: "145000.50",
      currency: "USD",
    };

    const created = await employeeService.createEmployee(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.employeeCode).toBe(input.employeeCode);
    expect(created.firstName).toBe("Jane");
    expect(created.lastName).toBe("Doe");
    expect(created.email).toBe(input.email);
    // Preserves exact decimal string representation matching numeric(12, 2)
    expect(created.salaryAmount).toBe("145000.50");
    expect(created.currency).toBe("USD");
    expect(created.createdAt).toBeInstanceOf(Date);
  });

  // Test 2: Validation rejections with invalid data
  it("should reject employee creation with invalid data schema", () => {
    // 2a: Reject negative salary
    const negativeSalaryResult = createEmployeeSchema.safeParse({
      employeeCode: `${TEST_CODE_PREFIX}INV-01`,
      firstName: "Bad",
      lastName: "Data",
      email: "bad.salary@acme-corp.synthetic",
      country: "United States",
      department: "Engineering",
      jobTitle: "Dev",
      salaryAmount: "-50000.00",
      currency: "USD",
    });
    expect(negativeSalaryResult.success).toBe(false);

    // 2b: Reject invalid currency code not in ISO 4217 allowlist
    const invalidCurrencyResult = createEmployeeSchema.safeParse({
      employeeCode: `${TEST_CODE_PREFIX}INV-02`,
      firstName: "Bad",
      lastName: "Currency",
      email: "bad.currency@acme-corp.synthetic",
      country: "United States",
      department: "Engineering",
      jobTitle: "Dev",
      salaryAmount: "50000.00",
      currency: "INVALID",
    });
    expect(invalidCurrencyResult.success).toBe(false);

    // 2c: Reject malformed email
    const invalidEmailResult = createEmployeeSchema.safeParse({
      employeeCode: `${TEST_CODE_PREFIX}INV-03`,
      firstName: "Bad",
      lastName: "Email",
      email: "not-an-email",
      country: "United States",
      department: "Engineering",
      jobTitle: "Dev",
      salaryAmount: "50000.00",
      currency: "USD",
    });
    expect(invalidEmailResult.success).toBe(false);

    // 2d: Reject salary exceeding numeric(12, 2) maximum (more than 10 integer digits)
    const excessSalaryResult = createEmployeeSchema.safeParse({
      employeeCode: `${TEST_CODE_PREFIX}INV-04`,
      firstName: "Bad",
      lastName: "Overflow",
      email: "overflow@acme-corp.synthetic",
      country: "United States",
      department: "Engineering",
      jobTitle: "Dev",
      salaryAmount: "99999999999999.00",
      currency: "USD",
    });
    expect(excessSalaryResult.success).toBe(false);
  });

  // Test 3: Duplicate employee code and email conflict handling
  it("should prevent duplicate employee codes and emails with EmployeeConflictError", async () => {
    const primaryInput = {
      employeeCode: `${TEST_CODE_PREFIX}DUP-01`,
      firstName: "Alice",
      lastName: "Smith",
      email: "alice.smith.test@acme-corp.synthetic",
      country: "United Kingdom",
      department: "Product",
      jobTitle: "Product Manager",
      salaryAmount: "85000.00",
      currency: "GBP",
    };

    await employeeService.createEmployee(primaryInput);

    // Attempt duplicate employeeCode
    await expect(
      employeeService.createEmployee({
        ...primaryInput,
        email: "different.email@acme-corp.synthetic",
      })
    ).rejects.toThrow(EmployeeConflictError);

    // Attempt duplicate email
    await expect(
      employeeService.createEmployee({
        ...primaryInput,
        employeeCode: `${TEST_CODE_PREFIX}DUP-02`,
      })
    ).rejects.toThrow(EmployeeConflictError);
  });

  // Test 4: Server-side search, filtering, and pagination
  it("should filter, search, and paginate employees correctly at database level", async () => {
    // Insert distinct test batch
    const emp1 = await employeeService.createEmployee({
      employeeCode: `${TEST_CODE_PREFIX}SEARCH-DE-01`,
      firstName: "Hans",
      lastName: "Gruber",
      email: "hans.gruber.test@acme-corp.synthetic",
      country: "Germany",
      department: "Finance",
      jobTitle: "Financial Controller",
      salaryAmount: "92000.00",
      currency: "EUR",
    });

    const emp2 = await employeeService.createEmployee({
      employeeCode: `${TEST_CODE_PREFIX}SEARCH-IN-01`,
      firstName: "Aarav",
      lastName: "Patel",
      email: "aarav.patel.test@acme-corp.synthetic",
      country: "India",
      department: "Engineering",
      jobTitle: "DevOps Engineer",
      salaryAmount: "2100000.00",
      currency: "INR",
    });

    // 4a: Test search by last name
    const searchResult = await employeeService.listEmployees({
      page: 1,
      pageSize: 10,
      search: "Gruber",
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    expect(searchResult.data.some((e) => e.id === emp1.id)).toBe(true);
    expect(searchResult.data.some((e) => e.id === emp2.id)).toBe(false);

    // 4b: Test country filter
    const countryResult = await employeeService.listEmployees({
      page: 1,
      pageSize: 10,
      country: "India",
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    expect(countryResult.data.some((e) => e.id === emp2.id)).toBe(true);
    expect(countryResult.data.every((e) => e.country === "India")).toBe(true);

    // 4c: Test pagination limits
    const pageResult = await employeeService.listEmployees({
      page: 1,
      pageSize: 1,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    expect(pageResult.data.length).toBeLessThanOrEqual(1);
    expect(pageResult.pagination.pageSize).toBe(1);
    expect(pageResult.pagination.totalPages).toBeGreaterThanOrEqual(1);
  });

  // Test 5: Employee retrieval, update, and deletion
  it("should retrieve, update, and delete an employee by UUID", async () => {
    const created = await employeeService.createEmployee({
      employeeCode: `${TEST_CODE_PREFIX}LIFECYCLE-01`,
      firstName: "Marcus",
      lastName: "Brody",
      email: "marcus.brody.test@acme-corp.synthetic",
      country: "Canada",
      department: "Marketing",
      jobTitle: "Marketing Lead",
      salaryAmount: "78000.00",
      currency: "CAD",
    });

    // Retrieve
    const fetched = await employeeService.getEmployeeById(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(created.id);

    // Partial Update
    const updated = await employeeService.updateEmployee(created.id, {
      jobTitle: "Senior Marketing Lead",
      salaryAmount: "85000.00",
    });

    expect(updated).not.toBeNull();
    expect(updated?.jobTitle).toBe("Senior Marketing Lead");
    expect(updated?.salaryAmount).toBe("85000.00");
    expect(new Date(updated!.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(created.createdAt).getTime()
    );

    // Delete
    const deleted = await employeeService.deleteEmployee(created.id);
    expect(deleted).not.toBeNull();
    expect(deleted?.id).toBe(created.id);

    // Confirm deletion
    const confirmedNull = await employeeService.getEmployeeById(created.id);
    expect(confirmedNull).toBeNull();
  });
});

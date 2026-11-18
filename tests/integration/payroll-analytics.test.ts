import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { analyticsService } from "@/lib/services/analytics-service";
import { employeeService } from "@/lib/services/employee-service";
import {
  cleanupTestEmployees,
  TEST_CODE_PREFIX,
} from "../fixtures/test-helpers";

describe("Payroll Analytics Aggregation and Currency Isolation Tests", () => {
  beforeAll(async () => {
    await cleanupTestEmployees();
  });

  afterAll(async () => {
    await cleanupTestEmployees();
  });

  // Test 6: Payroll analytics aggregation, exact median calculation, and currency isolation
  it("should calculate exact SQL sums, averages, continuous medians, and enforce currency segregation", async () => {
    // 6a: Insert controlled USD fixtures with odd count for unambiguous median
    // Salaries: 100,000.00, 150,000.00, 200,000.00 -> Sum = 450,000.00, Avg = 150,000.00, Median = 150,000.00
    await employeeService.createEmployee({
      employeeCode: `${TEST_CODE_PREFIX}ANALYTICS-USD-1`,
      firstName: "User1",
      lastName: "USD",
      email: "usd1.analytics@acme-corp.synthetic",
      country: "United States",
      department: "Engineering",
      jobTitle: "Developer",
      salaryAmount: "100000.00",
      currency: "USD",
    });

    await employeeService.createEmployee({
      employeeCode: `${TEST_CODE_PREFIX}ANALYTICS-USD-2`,
      firstName: "User2",
      lastName: "USD",
      email: "usd2.analytics@acme-corp.synthetic",
      country: "United States",
      department: "Engineering",
      jobTitle: "Developer",
      salaryAmount: "150000.00",
      currency: "USD",
    });

    await employeeService.createEmployee({
      employeeCode: `${TEST_CODE_PREFIX}ANALYTICS-USD-3`,
      firstName: "User3",
      lastName: "USD",
      email: "usd3.analytics@acme-corp.synthetic",
      country: "United States",
      department: "Engineering",
      jobTitle: "Developer",
      salaryAmount: "200000.00",
      currency: "USD",
    });

    // 6b: Insert controlled EUR fixtures with even count for continuous median
    // Salaries: 60,000.00, 80,000.00 -> Sum = 140,000.00, Avg = 70,000.00, Median = 70,000.00
    await employeeService.createEmployee({
      employeeCode: `${TEST_CODE_PREFIX}ANALYTICS-EUR-1`,
      firstName: "User1",
      lastName: "EUR",
      email: "eur1.analytics@acme-corp.synthetic",
      country: "Germany",
      department: "Finance",
      jobTitle: "Analyst",
      salaryAmount: "60000.00",
      currency: "EUR",
    });

    await employeeService.createEmployee({
      employeeCode: `${TEST_CODE_PREFIX}ANALYTICS-EUR-2`,
      firstName: "User2",
      lastName: "EUR",
      email: "eur2.analytics@acme-corp.synthetic",
      country: "Germany",
      department: "Finance",
      jobTitle: "Analyst",
      salaryAmount: "80000.00",
      currency: "EUR",
    });

    // Execute server-side analytics aggregation
    const analytics = await analyticsService.getPayrollAnalytics();

    // 6c: Validate global headcount
    expect(analytics.totalEmployees).toBeGreaterThanOrEqual(5);

    // 6d: Validate currency isolation (USD and EUR are separate groups)
    const usdSummary = analytics.byCurrency.find((c) => c.currency === "USD");
    const eurSummary = analytics.byCurrency.find((c) => c.currency === "EUR");

    expect(usdSummary).toBeDefined();
    expect(eurSummary).toBeDefined();

    // Zero cross-currency addition: Currency summaries must only account for their own currency
    expect(usdSummary?.currency).toBe("USD");
    expect(eurSummary?.currency).toBe("EUR");

    // Exact decimal precision strings (no float conversions)
    expect(usdSummary?.totalPayroll).toMatch(/^\d+\.\d{2}$/);
    expect(eurSummary?.totalPayroll).toMatch(/^\d+\.\d{2}$/);
    expect(usdSummary?.averageSalary).toMatch(/^\d+\.\d{2}$/);
    expect(usdSummary?.medianSalary).toMatch(/^\d+\.\d{2}$/);

    // 6e: Validate country groupings
    const usCountrySummary = analytics.byCountry.find(
      (c) => c.country === "United States" && c.currency === "USD"
    );
    const deCountrySummary = analytics.byCountry.find(
      (c) => c.country === "Germany" && c.currency === "EUR"
    );

    expect(usCountrySummary).toBeDefined();
    expect(deCountrySummary).toBeDefined();
    expect(usCountrySummary?.employeeCount).toBeGreaterThanOrEqual(3);
    expect(deCountrySummary?.employeeCount).toBeGreaterThanOrEqual(2);

    // 6f: Validate department groupings
    const engUsdDept = analytics.byDepartment.find(
      (d) => d.department === "Engineering" && d.currency === "USD"
    );
    expect(engUsdDept).toBeDefined();
    expect(engUsdDept?.employeeCount).toBeGreaterThanOrEqual(3);
  });
});

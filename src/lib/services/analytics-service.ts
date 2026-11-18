import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export interface CurrencySummary {
  currency: string;
  employeeCount: number;
  totalPayroll: string;
  averageSalary: string;
  medianSalary: string;
}

export interface CountryPayrollSummary {
  country: string;
  currency: string;
  employeeCount: number;
  totalPayroll: string;
  averageSalary: string;
  medianSalary: string;
}

export interface DepartmentPayrollSummary {
  department: string;
  currency: string;
  employeeCount: number;
  totalPayroll: string;
  averageSalary: string;
  medianSalary: string;
}

export interface PayrollAnalyticsResponse {
  totalEmployees: number;
  byCurrency: CurrencySummary[];
  byCountry: CountryPayrollSummary[];
  byDepartment: DepartmentPayrollSummary[];
}

interface CurrencyRow {
  currency: string;
  employee_count: number;
  total_payroll: string;
  average_salary: string;
  median_salary: string;
}

interface CountryRow {
  country: string;
  currency: string;
  employee_count: number;
  total_payroll: string;
  average_salary: string;
  median_salary: string;
}

interface DepartmentRow {
  department: string;
  currency: string;
  employee_count: number;
  total_payroll: string;
  average_salary: string;
  median_salary: string;
}

export const analyticsService = {
  /**
   * Computes comprehensive payroll analytics directly in PostgreSQL engine.
   * Enforces zero cross-currency addition; all monetary metrics are segmented by currency.
   * Preserves exact decimal precision by returning numeric values as formatted decimal strings.
   */
  async getPayrollAnalytics(): Promise<PayrollAnalyticsResponse> {
    const [
      totalCountResult,
      currencyAggregations,
      countryAggregations,
      departmentAggregations,
    ] = await Promise.all([
      // 1. Total employee count
      db.execute<{ total: number }>(
        sql`SELECT count(*)::int AS total FROM employees;`
      ),

      // 2. Average, median, total, and headcount grouped by currency
      db.execute<CurrencyRow>(sql`
        SELECT
          currency,
          count(*)::int AS employee_count,
          COALESCE(round(sum(salary_amount), 2)::text, '0.00') AS total_payroll,
          COALESCE(round(avg(salary_amount), 2)::text, '0.00') AS average_salary,
          COALESCE(round(percentile_cont(0.5) WITHIN GROUP (ORDER BY salary_amount)::numeric, 2)::text, '0.00') AS median_salary
        FROM employees
        GROUP BY currency
        ORDER BY currency ASC;
      `),

      // 3. Country-wise summaries grouped by country and currency
      db.execute<CountryRow>(sql`
        SELECT
          country,
          currency,
          count(*)::int AS employee_count,
          COALESCE(round(sum(salary_amount), 2)::text, '0.00') AS total_payroll,
          COALESCE(round(avg(salary_amount), 2)::text, '0.00') AS average_salary,
          COALESCE(round(percentile_cont(0.5) WITHIN GROUP (ORDER BY salary_amount)::numeric, 2)::text, '0.00') AS median_salary
        FROM employees
        GROUP BY country, currency
        ORDER BY country ASC, currency ASC;
      `),

      // 4. Department-wise summaries grouped by department and currency
      db.execute<DepartmentRow>(sql`
        SELECT
          department,
          currency,
          count(*)::int AS employee_count,
          COALESCE(round(sum(salary_amount), 2)::text, '0.00') AS total_payroll,
          COALESCE(round(avg(salary_amount), 2)::text, '0.00') AS average_salary,
          COALESCE(round(percentile_cont(0.5) WITHIN GROUP (ORDER BY salary_amount)::numeric, 2)::text, '0.00') AS median_salary
        FROM employees
        GROUP BY department, currency
        ORDER BY department ASC, currency ASC;
      `),
    ]);

    const totalEmployees = Number(totalCountResult.rows[0]?.total ?? 0);

    const byCurrency: CurrencySummary[] = currencyAggregations.rows.map(
      (row) => ({
        currency: String(row.currency),
        employeeCount: Number(row.employee_count),
        totalPayroll: String(row.total_payroll),
        averageSalary: String(row.average_salary),
        medianSalary: String(row.median_salary),
      })
    );

    const byCountry: CountryPayrollSummary[] = countryAggregations.rows.map(
      (row) => ({
        country: String(row.country),
        currency: String(row.currency),
        employeeCount: Number(row.employee_count),
        totalPayroll: String(row.total_payroll),
        averageSalary: String(row.average_salary),
        medianSalary: String(row.median_salary),
      })
    );

    const byDepartment: DepartmentPayrollSummary[] =
      departmentAggregations.rows.map((row) => ({
        department: String(row.department),
        currency: String(row.currency),
        employeeCount: Number(row.employee_count),
        totalPayroll: String(row.total_payroll),
        averageSalary: String(row.average_salary),
        medianSalary: String(row.median_salary),
      }));

    return {
      totalEmployees,
      byCurrency,
      byCountry,
      byDepartment,
    };
  },
};

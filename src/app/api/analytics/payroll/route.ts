import { NextResponse } from "next/server";
import { analyticsService } from "@/lib/services/analytics-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/analytics/payroll
 * Computes high-performance global payroll analytics directly in PostgreSQL:
 * - Total employee headcount
 * - Currency breakdown (headcount, total payroll, average salary, median salary)
 * - Country-wise breakdown per currency
 * - Department-wise breakdown per currency
 *
 * Strict financial invariants:
 * - Zero cross-currency summation.
 * - Exact decimal precision (all currency figures preserved as decimal strings).
 */
export async function GET() {
  try {
    const analytics = await analyticsService.getPayrollAnalytics();
    return NextResponse.json(analytics, { status: 200 });
  } catch (error) {
    console.error("GET /api/analytics/payroll error:", error);
    return NextResponse.json(
      { error: "Internal server error while computing payroll analytics" },
      { status: 500 }
    );
  }
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PayrollMetrics } from "@/components/analytics/payroll-metrics";
import { CurrencyBreakdownChart } from "@/components/analytics/currency-breakdown-chart";
import { CountryPayrollTable } from "@/components/analytics/country-payroll-table";
import { DepartmentPayrollTable } from "@/components/analytics/department-payroll-table";
import { Button } from "@/components/ui/button";
import type { PayrollAnalyticsResponse } from "@/lib/services/analytics-service";
import {
  BarChart3,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

export default function PayrollDashboardPage() {
  const [data, setData] = useState<PayrollAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analytics/payroll");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error ?? `Server returned status ${res.status}`
        );
      }

      const json: PayrollAnalyticsResponse = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to load payroll insights dashboard";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Payroll Insights
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              <BarChart3 className="h-3 w-3" />
              <span>Real-Time SQL Analytics</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Global workforce compensation distributions, statistical medians, and country/department aggregations.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchAnalytics}
          disabled={isLoading}
          className="gap-2 self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Analytics</span>
        </Button>
      </div>

      {/* Strict Currency Policy Alert Banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-950">
              ACME Financial Integrity Rule: Strict Multi-Currency Segregation
            </p>
            <p className="text-amber-800 leading-relaxed">
              Compensation figures across international offices are denominated in their respective local currencies.
              To eliminate false conversions and exchange-rate distortion, all summaries, averages, and continuous medians
              are calculated and displayed strictly by currency.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-red-200 text-center">
          <div className="rounded-full bg-red-100 p-3 text-red-600 mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            Unable to load payroll analytics
          </h3>
          <p className="text-xs text-slate-500 max-w-md mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchAnalytics} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Query</span>
          </Button>
        </div>
      ) : isLoading || !data ? (
        // Loading Skeleton
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-lg" />
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-slate-200 rounded-lg" />
            <div className="h-80 bg-slate-200 rounded-lg" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Summary Metric Cards */}
          <PayrollMetrics
            totalEmployees={data.totalEmployees}
            byCurrency={data.byCurrency}
          />

          {/* Section 2: Department Average vs Median Chart */}
          <CurrencyBreakdownChart
            byDepartment={data.byDepartment}
            byCurrency={data.byCurrency}
          />

          {/* Section 3: Country and Department Tables */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <CountryPayrollTable byCountry={data.byCountry} />
            <DepartmentPayrollTable
              byDepartment={data.byDepartment}
              byCurrency={data.byCurrency}
            />
          </div>
        </div>
      )}
    </div>
  );
}

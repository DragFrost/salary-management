"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type {
  DepartmentPayrollSummary,
  CurrencySummary,
} from "@/lib/services/analytics-service";

interface CurrencyBreakdownChartProps {
  byDepartment: DepartmentPayrollSummary[];
  byCurrency: CurrencySummary[];
}

export function CurrencyBreakdownChart({
  byDepartment,
  byCurrency,
}: CurrencyBreakdownChartProps) {
  // Default to first currency or USD
  const initialCurrency =
    byCurrency.find((c) => c.currency === "USD")?.currency ??
    byCurrency[0]?.currency ??
    "USD";

  const [selectedCurrency, setSelectedCurrency] = useState<string>(initialCurrency);

  // Filter department data strictly for the selected currency
  const filteredData = byDepartment
    .filter((d) => d.currency === selectedCurrency)
    .map((item) => ({
      department: item.department,
      currency: item.currency,
      employeeCount: item.employeeCount,
      average: parseFloat(item.averageSalary),
      median: parseFloat(item.medianSalary),
      averageFormatted: item.averageSalary,
      medianFormatted: item.medianSalary,
      totalFormatted: item.totalPayroll,
    }));

  const activeCurrencySummary = byCurrency.find(
    (c) => c.currency === selectedCurrency
  );

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-slate-900">
              Department Salary Comparison (Average vs. Median)
            </CardTitle>
            <Badge variant="currency" className="text-xs">
              {selectedCurrency}
            </Badge>
          </div>
          <CardDescription className="text-xs mt-1">
            Analyzing salary distributions per department in {selectedCurrency}. Currencies are strictly isolated to eliminate FX distortion.
          </CardDescription>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
            View Currency:
          </span>
          <div className="w-28">
            <Select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="h-8 text-xs"
            >
              {byCurrency.map((c) => (
                <option key={c.currency} value={c.currency}>
                  {c.currency}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {filteredData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-xs text-slate-400">
            No department data available for {selectedCurrency}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="department"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    tickFormatter={(val) =>
                      val >= 1000000
                        ? `${(val / 1000000).toFixed(1)}M`
                        : val >= 1000
                        ? `${(val / 1000).toFixed(0)}k`
                        : String(val)
                    }
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg text-xs space-y-1.5">
                            <p className="font-semibold text-slate-900 border-b pb-1">
                              {label} ({selectedCurrency})
                            </p>
                            <p className="text-slate-600">
                              Headcount:{" "}
                              <span className="font-semibold text-slate-900">
                                {data.employeeCount}
                              </span>
                            </p>
                            <p className="text-blue-600">
                              Average:{" "}
                              <span className="font-mono font-semibold">
                                {selectedCurrency} {Number(data.averageFormatted).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </p>
                            <p className="text-purple-600">
                              Median:{" "}
                              <span className="font-mono font-semibold">
                                {selectedCurrency} {Number(data.medianFormatted).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </p>
                            <p className="text-slate-500 pt-1 border-t text-[11px]">
                              Total Payroll: {selectedCurrency} {Number(data.totalFormatted).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 15, fontSize: 12 }}
                  />
                  <Bar
                    dataKey="average"
                    name={`Average Salary (${selectedCurrency})`}
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="median"
                    name={`Median Salary (${selectedCurrency})`}
                    fill="#8B5CF6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Currency Context Footer */}
            {activeCurrencySummary && (
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 border-t pt-3 bg-slate-50/50 p-3 rounded">
                <span>
                  Total {selectedCurrency} Headcount:{" "}
                  <strong className="text-slate-800">
                    {activeCurrencySummary.employeeCount.toLocaleString()}
                  </strong>
                </span>
                <span>
                  Total {selectedCurrency} Payroll:{" "}
                  <strong className="font-mono text-slate-800">
                    {selectedCurrency} {Number(activeCurrencySummary.totalPayroll).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </strong>
                </span>
                <span>
                  Global {selectedCurrency} Median:{" "}
                  <strong className="font-mono text-purple-700">
                    {selectedCurrency} {Number(activeCurrencySummary.medianSalary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </strong>
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

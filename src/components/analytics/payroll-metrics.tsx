"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CurrencySummary } from "@/lib/services/analytics-service";
import { Users, Coins, TrendingUp } from "lucide-react";

interface PayrollMetricsProps {
  totalEmployees: number;
  byCurrency: CurrencySummary[];
}

export function PayrollMetrics({
  totalEmployees,
  byCurrency,
}: PayrollMetricsProps) {
  const formatMonetaryString = (val: string): string => {
    const [intPart, decPart = "00"] = val.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedInt}.${decPart}`;
  };

  return (
    <div className="space-y-4">
      {/* Top Global Metric Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workforce Headcount */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Workforce
            </CardTitle>
            <div className="rounded-md bg-blue-50 p-2 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {totalEmployees.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active employees across international offices
            </p>
          </CardContent>
        </Card>

        {/* Operating Currencies */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Operating Currencies
            </CardTitle>
            <div className="rounded-md bg-emerald-50 p-2 text-emerald-600">
              <Coins className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {byCurrency.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Distinct ISO 4217 currency jurisdictions
            </p>
          </CardContent>
        </Card>

        {/* Largest Workforce Currency */}
        {byCurrency.length > 0 && (
          <>
            <Card className="bg-white sm:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Currency Distribution Policy
                </CardTitle>
                <div className="rounded-md bg-purple-50 p-2 text-purple-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {byCurrency.map((c) => (
                    <Badge key={c.currency} variant="secondary" className="gap-1 font-mono text-xs">
                      <span>{c.currency}:</span>
                      <span className="font-semibold text-slate-900">
                        {c.employeeCount.toLocaleString()}
                      </span>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  All compensation metrics are segmented strictly by local currency to preserve financial integrity.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Currency Payroll Summaries Grid */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600 mb-3">
          Payroll Summary by Currency
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {byCurrency.map((item) => (
            <Card key={item.currency} className="border-slate-200 hover:border-slate-300 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Badge variant="currency" className="text-xs font-bold">
                  {item.currency}
                </Badge>
                <span className="text-xs text-slate-500">
                  {item.employeeCount.toLocaleString()} staff
                </span>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="text-xs font-medium text-slate-500">Total Payroll</div>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    {formatMonetaryString(item.totalPayroll)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 block">Average</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatMonetaryString(item.averageSalary)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Median</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatMonetaryString(item.medianSalary)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

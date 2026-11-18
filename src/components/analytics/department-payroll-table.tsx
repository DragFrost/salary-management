"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import type {
  DepartmentPayrollSummary,
  CurrencySummary,
} from "@/lib/services/analytics-service";
import { Building2 } from "lucide-react";

interface DepartmentPayrollTableProps {
  byDepartment: DepartmentPayrollSummary[];
  byCurrency: CurrencySummary[];
}

export function DepartmentPayrollTable({
  byDepartment,
  byCurrency,
}: DepartmentPayrollTableProps) {
  const [filterCurrency, setFilterCurrency] = useState<string>("");

  const formatMonetaryString = (val: string): string => {
    const [intPart, decPart = "00"] = val.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedInt}.${decPart}`;
  };

  const displayedRows = filterCurrency
    ? byDepartment.filter((d) => d.currency === filterCurrency)
    : byDepartment;

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-purple-50 p-1.5 text-purple-600">
              <Building2 className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Department-Wise Payroll Distribution
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Compensation benchmarks and workforce allocation per functional department.
          </CardDescription>
        </div>

        {/* Currency Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Filter Currency:
          </span>
          <div className="w-32">
            <Select
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
              className="h-8 text-xs"
            >
              <option value="">All Currencies</option>
              {byCurrency.map((c) => (
                <option key={c.currency} value={c.currency}>
                  {c.currency}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Department</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Headcount</TableHead>
              <TableHead className="text-right">Total Payroll</TableHead>
              <TableHead className="text-right">Average Salary</TableHead>
              <TableHead className="text-right">Median Salary</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {displayedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                  No department records match filter
                </TableCell>
              </TableRow>
            ) : (
              displayedRows.map((row) => (
                <TableRow key={`${row.department}-${row.currency}`}>
                  <TableCell className="font-medium text-slate-900">
                    {row.department}
                  </TableCell>

                  <TableCell>
                    <Badge variant="currency" className="text-[10px]">
                      {row.currency}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right font-medium text-slate-700">
                    {row.employeeCount.toLocaleString()}
                  </TableCell>

                  <TableCell className="text-right font-mono font-semibold text-slate-900">
                    {formatMonetaryString(row.totalPayroll)}
                  </TableCell>

                  <TableCell className="text-right font-mono text-slate-700">
                    {formatMonetaryString(row.averageSalary)}
                  </TableCell>

                  <TableCell className="text-right font-mono text-purple-700 font-medium">
                    {formatMonetaryString(row.medianSalary)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

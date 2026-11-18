"use client";

import React from "react";
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
import type { CountryPayrollSummary } from "@/lib/services/analytics-service";
import { Globe } from "lucide-react";

interface CountryPayrollTableProps {
  byCountry: CountryPayrollSummary[];
}

export function CountryPayrollTable({ byCountry }: CountryPayrollTableProps) {
  const formatMonetaryString = (val: string): string => {
    const [intPart, decPart = "00"] = val.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedInt}.${decPart}`;
  };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-blue-50 p-1.5 text-blue-600">
            <Globe className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold text-slate-900">
            Country-Wise Payroll Distribution
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          Headcount and compensation breakdown by country and operating currency.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Country</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Headcount</TableHead>
              <TableHead className="text-right">Total Payroll</TableHead>
              <TableHead className="text-right">Average Salary</TableHead>
              <TableHead className="text-right">Median Salary</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {byCountry.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                  No country records found
                </TableCell>
              </TableRow>
            ) : (
              byCountry.map((row) => (
                <TableRow key={`${row.country}-${row.currency}`}>
                  <TableCell className="font-medium text-slate-900">
                    {row.country}
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

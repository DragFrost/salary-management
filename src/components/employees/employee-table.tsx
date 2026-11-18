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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Employee } from "@/lib/db/schema";
import { Eye, Edit2, Trash2, Users, AlertCircle, RefreshCw } from "lucide-react";

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeTable({
  employees,
  isLoading,
  error,
  onRetry,
  onView,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  // Format numeric string with comma separators without IEEE float casting
  const formatMonetaryString = (val: string): string => {
    const [intPart, decPart = "00"] = val.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedInt}.${decPart}`;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-red-200 text-center">
        <div className="rounded-full bg-red-100 p-3 text-red-600 mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          Failed to load employee records
        </h3>
        <p className="text-xs text-slate-500 max-w-md mb-4">{error}</p>
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Connection</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[110px]">Code</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="hidden sm:table-cell">Country</TableHead>
            <TableHead className="text-right">Compensation</TableHead>
            <TableHead className="text-right w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            // Loading skeleton rows
            Array.from({ length: 10 }).map((_, idx) => (
              <TableRow key={`skeleton-${idx}`} className="animate-pulse">
                <TableCell>
                  <div className="h-4 w-16 bg-slate-200 rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-32 bg-slate-200 rounded mb-1" />
                  <div className="h-3 w-20 bg-slate-100 rounded md:hidden" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="h-4 w-40 bg-slate-200 rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="h-4 w-20 bg-slate-200 rounded" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-4 w-24 bg-slate-200 rounded ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-8 w-20 bg-slate-200 rounded ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : employees.length === 0 ? (
            // Empty state
            <TableRow>
              <TableCell colSpan={7} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="rounded-full bg-slate-100 p-3 text-slate-400">
                    <Users className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    No employees found
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    No records match the active search or filter criteria. Try resetting filters or adding a new employee.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            // Data rows
            employees.map((emp) => (
              <TableRow key={emp.id} className="group">
                {/* Employee Code */}
                <TableCell className="font-mono text-xs font-semibold text-slate-700">
                  {emp.employeeCode}
                </TableCell>

                {/* Name & Job Title */}
                <TableCell>
                  <div className="font-medium text-slate-900">
                    {emp.firstName} {emp.lastName}
                  </div>
                  <div className="text-xs text-slate-500">{emp.jobTitle}</div>
                </TableCell>

                {/* Email */}
                <TableCell className="hidden md:table-cell text-xs font-mono text-slate-600">
                  {emp.email}
                </TableCell>

                {/* Department */}
                <TableCell>
                  <Badge variant="secondary" className="text-[11px] font-normal">
                    {emp.department}
                  </Badge>
                </TableCell>

                {/* Country */}
                <TableCell className="hidden sm:table-cell text-xs text-slate-700">
                  {emp.country}
                </TableCell>

                {/* Compensation */}
                <TableCell className="text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <Badge variant="currency" className="text-[10px] px-1.5 py-0">
                      {emp.currency}
                    </Badge>
                    <span className="font-mono text-xs font-semibold text-slate-900">
                      {formatMonetaryString(emp.salaryAmount)}
                    </span>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-slate-900"
                      onClick={() => onView(emp)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-blue-600"
                      onClick={() => onEdit(emp)}
                      title="Edit Employee"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-red-600"
                      onClick={() => onDelete(emp)}
                      title="Delete Employee"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

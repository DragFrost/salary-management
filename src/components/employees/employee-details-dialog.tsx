"use client";

import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Employee } from "@/lib/db/schema";
import {
  Building2,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

interface EmployeeDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onEditClick: () => void;
}

export function EmployeeDetailsDialog({
  open,
  onOpenChange,
  employee,
  onEditClick,
}: EmployeeDetailsDialogProps) {
  if (!employee) return null;

  // Format monetary amount with commas without IEEE float conversion
  const formatMonetaryString = (val: string): string => {
    const [intPart, decPart = "00"] = val.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedInt}.${decPart}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="font-mono text-xs">
            {employee.employeeCode}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {employee.department}
          </Badge>
        </div>
        <DialogTitle className="text-xl">
          {employee.firstName} {employee.lastName}
        </DialogTitle>
        <DialogDescription>{employee.jobTitle}</DialogDescription>
      </DialogHeader>

      <div className="space-y-5 my-2">
        {/* Core Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 text-slate-700">
            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate text-xs font-mono">{employee.email}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs">{employee.country}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs">{employee.department}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs">{employee.jobTitle}</span>
          </div>
        </div>

        {/* Compensation Card */}
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Annual Compensation
            </span>
            <Badge variant="currency" className="text-xs">
              {employee.currency}
            </Badge>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
              {formatMonetaryString(employee.salaryAmount)}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {employee.currency} / year
            </span>
          </div>

          {/* Strict Currency Isolation Notice */}
          <div className="mt-3 flex items-start gap-2 text-[11px] text-blue-900/80 bg-white/70 p-2.5 rounded border border-blue-100">
            <AlertTriangle className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
            <span>
              Compensation is denominated in local currency (<strong>{employee.currency}</strong>).
              ACME strict policy prohibits cross-currency direct comparison without normalized FX spot calculations.
            </span>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Added: {new Date(employee.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-slate-400" />
            <span>Updated: {new Date(employee.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
        <Button
          type="button"
          onClick={() => {
            onOpenChange(false);
            onEditClick();
          }}
        >
          Edit Employee
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

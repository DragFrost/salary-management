"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Employee } from "@/lib/db/schema";
import { AlertCircle, AlertTriangle, Loader2 } from "lucide-react";

interface EmployeeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSuccess: () => void;
}

export function EmployeeDeleteDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: EmployeeDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!employee) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to delete employee record.");
        return;
      }

      onSuccess();
      onOpenChange(false);
    } catch {
      setError("Network error while attempting to delete employee.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <div className="mx-auto sm:mx-0 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 mb-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <DialogTitle className="text-red-900">Confirm Employee Deletion</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete{" "}
          <strong className="text-slate-900">
            {employee.firstName} {employee.lastName}
          </strong>{" "}
          (<span className="font-mono text-xs">{employee.employeeCode}</span>)?
          This action will immediately remove the employee from the ACME database.
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="my-2 flex items-center gap-2 rounded-md bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
          className="gap-2"
        >
          {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>Delete Employee</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

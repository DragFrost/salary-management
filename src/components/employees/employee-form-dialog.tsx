"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ISO_4217_CURRENCIES } from "@/lib/validations/employee";
import type { Employee } from "@/lib/db/schema";
import { AlertCircle, Loader2 } from "lucide-react";

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeToEdit?: Employee | null;
  onSuccess: () => void;
}

interface FormState {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  department: string;
  jobTitle: string;
  salaryAmount: string;
  currency: string;
}

const DEFAULT_FORM: FormState = {
  employeeCode: "",
  firstName: "",
  lastName: "",
  email: "",
  country: "United States",
  department: "Engineering",
  jobTitle: "",
  salaryAmount: "",
  currency: "USD",
};

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  "United States": "USD",
  "United Kingdom": "GBP",
  Germany: "EUR",
  India: "INR",
  Canada: "CAD",
  Australia: "AUD",
  Japan: "JPY",
};

const COMMON_DEPARTMENTS = [
  "Engineering",
  "Product",
  "Human Resources",
  "Finance",
  "Sales",
  "Marketing",
  "Operations",
];

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employeeToEdit,
  onSuccess,
}: EmployeeFormDialogProps) {
  const isEditing = Boolean(employeeToEdit);
  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        employeeCode: employeeToEdit.employeeCode,
        firstName: employeeToEdit.firstName,
        lastName: employeeToEdit.lastName,
        email: employeeToEdit.email,
        country: employeeToEdit.country,
        department: employeeToEdit.department,
        jobTitle: employeeToEdit.jobTitle,
        salaryAmount: employeeToEdit.salaryAmount,
        currency: employeeToEdit.currency,
      });
    } else {
      setFormData(DEFAULT_FORM);
    }
    setFieldErrors({});
    setGeneralError(null);
  }, [employeeToEdit, open]);

  const handleCountryChange = (country: string) => {
    const suggestedCurrency = COUNTRY_CURRENCY_MAP[country] ?? formData.currency;
    setFormData((prev) => ({
      ...prev,
      country,
      currency: suggestedCurrency,
    }));
  };

  const validateClient = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.employeeCode.trim()) {
      errors.employeeCode = "Employee code is required";
    }
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Valid email address is required";
    }
    if (!formData.jobTitle.trim()) {
      errors.jobTitle = "Job title is required";
    }
    if (!formData.salaryAmount.trim() || !/^\d{1,10}(\.\d{1,2})?$/.test(formData.salaryAmount.trim())) {
      errors.salaryAmount = "Positive decimal amount required (up to 10 digits, max 2 decimals)";
    } else if (/^0+(\.0+)?$/.test(formData.salaryAmount.trim())) {
      errors.salaryAmount = "Salary must be greater than zero";
    }
    if (!formData.currency.trim() || !/^[A-Z]{3}$/.test(formData.currency.trim())) {
      errors.currency = "Valid 3-letter ISO 4217 code required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateClient()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/employees/${employeeToEdit!.id}`
        : `/api/employees`;

      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          const field = data.details?.field;
          if (field && typeof field === "string") {
            setFieldErrors((prev) => ({ ...prev, [field]: data.error }));
          }
          setGeneralError(data.error ?? "A conflict occurred with an existing employee record");
        } else if (res.status === 400 && data.details?.fieldErrors) {
          const formatted: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(data.details.fieldErrors)) {
            if (Array.isArray(msgs) && msgs.length > 0) {
              formatted[key] = String(msgs[0]);
            }
          }
          setFieldErrors(formatted);
          setGeneralError(data.error ?? "Validation failed");
        } else {
          setGeneralError(data.error ?? "An unexpected error occurred");
        }
        return;
      }

      onSuccess();
      onOpenChange(false);
    } catch {
      setGeneralError("Network connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Employee Record" : "Add New Employee"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? `Update details for employee ${employeeToEdit?.employeeCode}.`
            : "Register a new employee with accurate compensation and department attributes."}
        </DialogDescription>
      </DialogHeader>

      {/* Global Error Banner */}
      {generalError && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Code and Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Employee Code <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.employeeCode}
              onChange={(e) =>
                setFormData({ ...formData, employeeCode: e.target.value })
              }
              placeholder="e.g. ACM-10001"
              disabled={isSubmitting}
            />
            {fieldErrors.employeeCode && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.employeeCode}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="e.g. alex.smith@acme-corp.synthetic"
              disabled={isSubmitting}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
            )}
          </div>
        </div>

        {/* Row 2: First and Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              placeholder="First name"
              disabled={isSubmitting}
            />
            {fieldErrors.firstName && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.firstName}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Last Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              placeholder="Last name"
              disabled={isSubmitting}
            />
            {fieldErrors.lastName && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        {/* Row 3: Country and Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Country <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.country}
              onChange={(e) => handleCountryChange(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Germany">Germany</option>
              <option value="India">India</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Japan">Japan</option>
            </Select>
            {fieldErrors.country && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.country}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Department <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              disabled={isSubmitting}
            >
              {COMMON_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
            {fieldErrors.department && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.department}</p>
            )}
          </div>
        </div>

        {/* Row 4: Job Title */}
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">
            Job Title <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.jobTitle}
            onChange={(e) =>
              setFormData({ ...formData, jobTitle: e.target.value })
            }
            placeholder="e.g. Senior Software Engineer"
            disabled={isSubmitting}
          />
          {fieldErrors.jobTitle && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.jobTitle}</p>
          )}
        </div>

        {/* Row 5: Salary and Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Annual Salary (Decimal String) <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.salaryAmount}
              onChange={(e) =>
                setFormData({ ...formData, salaryAmount: e.target.value })
              }
              placeholder="e.g. 125000.00"
              disabled={isSubmitting}
            />
            {fieldErrors.salaryAmount && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.salaryAmount}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Currency <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
              disabled={isSubmitting}
            >
              {ISO_4217_CURRENCIES.map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </Select>
            {fieldErrors.currency && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.currency}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isEditing ? "Save Changes" : "Create Employee"}</span>
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

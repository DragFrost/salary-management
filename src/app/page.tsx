"use client";

import React, { useState, useEffect, useCallback } from "react";
import { EmployeeTable } from "@/components/employees/employee-table";
import { EmployeeFilters } from "@/components/employees/employee-filters";
import { EmployeePagination } from "@/components/employees/employee-pagination";
import { EmployeeFormDialog } from "@/components/employees/employee-form-dialog";
import { EmployeeDetailsDialog } from "@/components/employees/employee-details-dialog";
import { EmployeeDeleteDialog } from "@/components/employees/employee-delete-dialog";
import { Button } from "@/components/ui/button";
import type { Employee } from "@/lib/db/schema";
import { UserPlus, Users } from "lucide-react";

const FILTER_COUNTRIES = [
  "United States",
  "United Kingdom",
  "Germany",
  "India",
  "Canada",
  "Australia",
  "Japan",
];

const FILTER_DEPARTMENTS = [
  "Engineering",
  "Product",
  "Human Resources",
  "Finance",
  "Sales",
  "Marketing",
  "Operations",
];

export default function EmployeeManagementPage() {
  // Query & Filter states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [country, setCountry] = useState("");
  const [department, setDepartment] = useState("");

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [employeeToView, setEmployeeToView] = useState<Employee | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // 300ms Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search term
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch employees from existing REST API
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });

      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }
      if (country) {
        params.set("country", country);
      }
      if (department) {
        params.set("department", department);
      }

      const res = await fetch(`/api/employees?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error ?? `Server returned error status ${res.status}`
        );
      }

      const json = await res.json();
      setEmployees(json.data ?? []);
      setTotal(json.pagination?.total ?? 0);
      setTotalPages(json.pagination?.totalPages ?? 1);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load employee directory";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch, country, department]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    setPage(1);
  };

  const handleDepartmentChange = (newDept: string) => {
    setDepartment(newDept);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCountry("");
    setDepartment("");
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Employee Directory
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              <Users className="h-3 w-3" />
              <span>{total.toLocaleString()}</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Search, filter, and manage global workforce records across 10,000 employees.
          </p>
        </div>

        <Button
          onClick={() => {
            setEmployeeToEdit(null);
            setIsFormOpen(true);
          }}
          className="gap-2 shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Employee</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <EmployeeFilters
        search={search}
        onSearchChange={setSearch}
        country={country}
        onCountryChange={handleCountryChange}
        department={department}
        onDepartmentChange={handleDepartmentChange}
        onReset={handleResetFilters}
        countries={FILTER_COUNTRIES}
        departments={FILTER_DEPARTMENTS}
      />

      {/* Main Employee Data Table */}
      <EmployeeTable
        employees={employees}
        isLoading={isLoading}
        error={error}
        onRetry={fetchEmployees}
        onView={(emp) => {
          setEmployeeToView(emp);
          setIsDetailsOpen(true);
        }}
        onEdit={(emp) => {
          setEmployeeToEdit(emp);
          setIsFormOpen(true);
        }}
        onDelete={(emp) => {
          setEmployeeToDelete(emp);
          setIsDeleteOpen(true);
        }}
      />

      {/* Server-Side Pagination Controls */}
      <EmployeePagination
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        isLoading={isLoading}
      />

      {/* Create / Edit Modal Dialog */}
      <EmployeeFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        employeeToEdit={employeeToEdit}
        onSuccess={fetchEmployees}
      />

      {/* Employee Details Modal Dialog */}
      <EmployeeDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        employee={employeeToView}
        onEditClick={() => {
          setEmployeeToEdit(employeeToView);
          setIsFormOpen(true);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <EmployeeDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        employee={employeeToDelete}
        onSuccess={fetchEmployees}
      />
    </div>
  );
}

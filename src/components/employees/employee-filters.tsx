"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";

interface EmployeeFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  country: string;
  onCountryChange: (value: string) => void;
  department: string;
  onDepartmentChange: (value: string) => void;
  onReset: () => void;
  countries: string[];
  departments: string[];
}

export function EmployeeFilters({
  search,
  onSearchChange,
  country,
  onCountryChange,
  department,
  onDepartmentChange,
  onReset,
  countries,
  departments,
}: EmployeeFiltersProps) {
  const hasActiveFilters = Boolean(search || country || department);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      {/* Search Bar */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by code, name, or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Country Filter */}
        <div className="w-[160px]">
          <Select
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        {/* Department Filter */}
        <div className="w-[180px]">
          <Select
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-slate-600 hover:text-slate-900 gap-1.5 h-9"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
}

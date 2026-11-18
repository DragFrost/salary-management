"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EmployeePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
}

export function EmployeePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  isLoading,
}: EmployeePaginationProps) {
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3 bg-white rounded-lg border border-slate-200">
      {/* Item summary */}
      <div className="text-xs text-slate-600">
        Showing <span className="font-semibold text-slate-900">{startItem.toLocaleString()}</span> to{" "}
        <span className="font-semibold text-slate-900">{endItem.toLocaleString()}</span> of{" "}
        <span className="font-semibold text-slate-900">{total.toLocaleString()}</span> employees
      </div>

      <div className="flex items-center gap-4">
        {/* Page size selector */}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>Rows per page:</span>
          <div className="w-18">
            <Select
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={isLoading}
              className="h-8 text-xs py-0"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Select>
          </div>
        </div>

        {/* Page indicator & navigation buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">
            Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
            <span className="font-semibold text-slate-900">{totalPages || 1}</span>
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || isLoading}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

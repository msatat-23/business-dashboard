'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { CustomSelect, SelectOption } from './Select';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className = '',
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers array with smart ellipses
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [1];

    if (currentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const pageSizeSelectOptions: SelectOption<string>[] = pageSizeOptions.map((opt) => ({
    value: String(opt),
    label: `${opt} / page`,
  }));

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-2xs ${className}`}
    >
      {/* Left section: Summary & Items per page */}
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 w-full sm:w-auto text-xs font-sans text-slate-600">
        <div>
          Showing <span className="font-extrabold text-slate-900">{startIndex}</span> to{' '}
          <span className="font-extrabold text-slate-900">{endIndex}</span> of{' '}
          <span className="font-extrabold text-slate-900">{totalItems}</span> entries
        </div>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-0 sm:ml-2 border-l sm:border-slate-200 sm:pl-3">
            <span className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Per Page:
            </span>
            <CustomSelect
              value={String(pageSize)}
              onChange={(val) => onPageSizeChange(Number(val))}
              options={pageSizeSelectOptions}
              size="sm"
              minWidth="min-w-[110px]"
            />
          </div>
        )}
      </div>

      {/* Right section: Navigation buttons */}
      <div className="flex items-center gap-1.5 self-center sm:self-auto">
        {/* First Page button */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          title="First Page"
          className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
        >
          <ChevronsLeft size={15} />
        </button>

        {/* Previous Page button */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          title="Previous Page"
          className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Numeric page buttons */}
        <div className="hidden sm:flex items-center gap-1 mx-1">
          {pageNumbers.map((p, idx) => {
            if (typeof p === 'string') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-slate-400 text-xs font-bold select-none"
                >
                  ...
                </span>
              );
            }

            const isCurrent = p === currentPage;

            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-gradient-to-r from-[#f43f5e] to-[#e11d48] text-white shadow-md shadow-[#f43f5e]/25 font-black scale-105'
                    : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Mobile current indicator */}
        <div className="sm:hidden px-3 py-1 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg">
          {currentPage} / {totalPages}
        </div>

        {/* Next Page button */}
        <button
          type="button"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          title="Next Page"
          className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
        >
          <ChevronRight size={15} />
        </button>

        {/* Last Page button */}
        <button
          type="button"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(totalPages)}
          title="Last Page"
          className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
        >
          <ChevronsRight size={15} />
        </button>
      </div>
    </div>
  );
}

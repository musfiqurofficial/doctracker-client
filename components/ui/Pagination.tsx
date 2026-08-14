'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords?: number;
  limit?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalRecords,
  limit = 10,
}: PaginationProps) {
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalRecords || currentPage * limit);

  // Helper to generate truncated page numbers with ellipsis
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      {/* Information string */}
      <div className="text-xs text-muted-foreground">
        {totalRecords ? (
          <span>
            Showing <strong className="font-semibold text-foreground">{startItem}</strong> to{' '}
            <strong className="font-semibold text-foreground">{endItem}</strong> of{' '}
            <strong className="font-semibold text-foreground">{totalRecords}</strong> records
          </span>
        ) : (
          <span>
            Page <strong className="font-semibold text-foreground">{currentPage}</strong> of{' '}
            <strong className="font-semibold text-foreground">{totalPages || 1}</strong>
          </span>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={cn(
            'p-2 rounded border border-border bg-card text-foreground text-xs font-medium flex items-center gap-1 transition-all',
            currentPage <= 1
              ? 'opacity-50 cursor-not-allowed pointer-events-none'
              : 'hover:bg-accent hover:border-primary/40'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={'ellipsis-' + index}
                className="w-8 h-8 flex items-center justify-center text-xs text-muted-foreground font-bold select-none"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'w-8 h-8 rounded text-xs font-semibold flex items-center justify-center transition-all',
                currentPage === pageNum
                  ? 'bg-primary text-primary-foreground shadow-sm font-bold'
                  : 'bg-card border border-border text-foreground hover:bg-accent'
              )}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={cn(
            'p-2 rounded border border-border bg-card text-foreground text-xs font-medium flex items-center gap-1 transition-all',
            currentPage >= totalPages
              ? 'opacity-50 cursor-not-allowed pointer-events-none'
              : 'hover:bg-accent hover:border-primary/40'
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  showFirstLast?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  pageSize,
  totalCount,
  pageCount,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  showFirstLast = false,
  className = '',
}: PaginationProps) {
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Don't render if there's only one page and no items
  if (pageCount <= 1 && totalCount === 0) {
    return null;
  }

  // Don't render if there's only one page (unless forced)
  if (pageCount <= 1 && totalCount > 0) {
    // Still show page size selector if enabled
    if (showPageSizeSelector) {
      return (
        <div className={`flex items-center justify-between ${className}`}>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {startItem} to {endItem} of {totalCount} results
          </div>
        <div className="flex items-center gap-2">
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value))}>
            <SelectTrigger className="w-[70px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">per page</span>
        </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {startItem} to {endItem} of {totalCount} results
      </div>
      <div className="flex items-center gap-4">
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value))}>
              <SelectTrigger className="w-[70px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">per page</span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          {showFirstLast && (
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => onPageChange(1)}
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            title="Previous page"
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            {!showFirstLast && <span>Previous</span>}
          </Button>
          
          <div className="flex items-center justify-center min-w-[100px] px-3">
            <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Page {currentPage} of {pageCount}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= pageCount}
            onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
            title="Next page"
            className="gap-1"
          >
            {!showFirstLast && <span>Next</span>}
            <ChevronRight className="h-4 w-4" />
          </Button>
          {showFirstLast && (
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= pageCount}
              onClick={() => onPageChange(pageCount)}
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


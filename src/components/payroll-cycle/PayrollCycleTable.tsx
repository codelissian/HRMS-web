import React, { useState, useEffect, useRef } from 'react';
import { DataTable, Column, TableAction } from '@/components/common/DataTable';
import { PayrollCycle } from '@/types/payrollCycle';
import { PayrollCycleService } from '@/services/payrollCycleService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { PayrollCycleUpdateDialog } from './PayrollCycleUpdateDialog';
import { Pagination } from '@/components/common';

// Helper function to check if error is a network error
const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  // Check for network-related error codes
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.code === 'ERR_NETWORK') {
    return true;
  }
  
  // Check if error message contains network-related keywords
  const networkKeywords = ['network', 'timeout', 'connection', 'failed to fetch', 'network error'];
  const errorMessage = (error.message || '').toLowerCase();
  return networkKeywords.some(keyword => errorMessage.includes(keyword));
};

// Retry function with exponential backoff
const retryWithBackoff = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Only retry network errors
      if (!isNetworkError(error) || attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = delay * Math.pow(2, attempt);
      console.log(`⚠️ Network error, retrying in ${waitTime}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};

export function PayrollCycleTable() {
  const [payrollCycles, setPayrollCycles] = useState<PayrollCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedPayrollCycle, setSelectedPayrollCycle] = useState<PayrollCycle | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPayrollCycles = async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await retryWithBackoff(() => 
        PayrollCycleService.getPayrollCycles({
          page: currentPage,
          page_size: pageSize
        })
      );
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      setPayrollCycles(response.data);
      setTotalCount(response.total_count || 0);
      setPageCount(response.page_count || 0);
    } catch (err: any) {
      // Don't set error if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      const isNetwork = isNetworkError(err);
      const errorMessage = isNetwork
        ? 'Network error: Please check your internet connection and try again.'
        : err.message || 'Failed to fetch payroll cycles';
      
      setError(errorMessage);
      console.error('Error fetching payroll cycles:', err);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
      setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPayrollCycles();
    
    // Cleanup: abort request on unmount or when dependencies change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentPage, pageSize]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: 'secondary' as const, label: 'Draft' },
      ACTIVE: { variant: 'default' as const, label: 'Active' },
      PAID: { variant: 'outline' as const, label: 'Paid' },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getMonthName = (monthNumber: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || `Month ${monthNumber}`;
  };

  const columns: Column<PayrollCycle>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
    },
    {
      key: 'pay_period_start',
      header: 'Pay Period Start',
      render: (value) => formatDate(value),
      sortable: true,
    },
    {
      key: 'pay_period_end',
      header: 'Pay Period End',
      render: (value) => formatDate(value),
      sortable: true,
    },
    {
      key: 'salary_month',
      header: 'Salary Month',
      render: (value, row) => `${getMonthName(value)} ${row.salary_year}`,
      sortable: true,
    },
    {
      key: 'working_days',
      header: 'Working Days',
      render: (value) => value.toString(),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => getStatusBadge(value),
      sortable: true,
    },
    {
      key: 'active_flag',
      header: 'Active',
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      ),
      sortable: true,
    },
  ];

  const handleUpdate = (payrollCycle: PayrollCycle) => {
    setSelectedPayrollCycle(payrollCycle);
    setUpdateDialogOpen(true);
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await PayrollCycleService.updatePayrollCycleStatus(id, status as 'DRAFT' | 'PROCESSING' | 'PAID');
      await fetchPayrollCycles(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to update payroll cycle status');
      throw err; // Re-throw to let the dialog handle the error
    }
  };

  const actions: TableAction<PayrollCycle>[] = [
    {
      label: 'Update',
      onClick: handleUpdate,
      textOnly: true,
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button onClick={fetchPayrollCycles} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DataTable
        data={payrollCycles}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable={false}
      />
      
      {/* Pagination */}
      {totalCount > 0 && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={totalCount}
              pageCount={pageCount}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newPageSize) => {
                setPageSize(newPageSize);
                setCurrentPage(1);
              }}
              showFirstLast={false}
            />
          </CardContent>
        </Card>
      )}
      
      <PayrollCycleUpdateDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        payrollCycle={selectedPayrollCycle}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
}
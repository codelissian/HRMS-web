import React, { useState, useEffect } from 'react';
import { DataTable, Column, TableAction } from '@/components/common/DataTable';
import { PayrollCycle } from '@/types/payrollCycle';
import { PayrollCycleService } from '@/services/payrollCycleService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { PayrollCycleUpdateDialog } from './PayrollCycleUpdateDialog';
import { Pagination } from '@/components/common';

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

  const fetchPayrollCycles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PayrollCycleService.getPayrollCycles({
        page: currentPage,
        page_size: pageSize
      });
      setPayrollCycles(response.data);
      setTotalCount(response.total_count || 0);
      setPageCount(response.page_count || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payroll cycles');
      console.error('Error fetching payroll cycles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollCycles();
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
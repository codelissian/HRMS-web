import React, { useState, useEffect } from 'react';
import { DataTable, Column, TableAction } from '@/components/common/DataTable';
import { PayrollCycle } from '@/types/payrollCycle';
import { PayrollCycleService } from '@/services/payrollCycleService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { PayrollCycleUpdateDialog } from './PayrollCycleUpdateDialog';

export function PayrollCycleTable() {
  const [payrollCycles, setPayrollCycles] = useState<PayrollCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedPayrollCycle, setSelectedPayrollCycle] = useState<PayrollCycle | null>(null);

  const fetchPayrollCycles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PayrollCycleService.getPayrollCycles();
      setPayrollCycles(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payroll cycles');
      console.error('Error fetching payroll cycles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollCycles();
  }, []);

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
      
      <PayrollCycleUpdateDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        payrollCycle={selectedPayrollCycle}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
}
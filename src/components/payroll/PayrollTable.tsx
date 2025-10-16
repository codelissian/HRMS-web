import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/common/DataTable';
import { Payroll } from '@/types/payroll';
import { PayrollService } from '@/services/payrollService';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface PayrollTableProps {
  payrollCycleId?: string | null;
}

export function PayrollTable({ payrollCycleId }: PayrollTableProps) {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (payrollCycleId) {
        response = await PayrollService.getPayrollsByCycle(payrollCycleId);
      } else {
        response = await PayrollService.getPayrolls();
      }
      
      setPayrolls(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payrolls');
      console.error('Error fetching payrolls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [payrollCycleId]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: 'secondary' as const, label: 'Draft' },
      PROCESSING: { variant: 'default' as const, label: 'Processing' },
      PAID: { variant: 'outline' as const, label: 'Paid' },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const columns: Column<Payroll>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (value, row) => (
        <div>
          <div className="font-medium">{row.employee?.name || 'Unknown'}</div>
          <div className="text-sm text-gray-500">{row.employee?.code || '-'}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'working_days',
      header: 'Working Days',
      render: (value) => value.toString(),
      sortable: true,
    },
    {
      key: 'absent_days',
      header: 'Absent Days',
      render: (value) => value.toString(),
      sortable: true,
    },
    {
      key: 'leave_days',
      header: 'Leave Days',
      render: (value) => value.toString(),
      sortable: true,
    },
    {
      key: 'unpaid_leave_days',
      header: 'Unpaid Leave Days',
      render: (value) => value.toString(),
      sortable: true,
    },
    {
      key: 'overtime_hours',
      header: 'Overtime Hours',
      render: (value) => value.toString(),
      sortable: true,
    },
    {
      key: 'net_salary',
      header: 'Net Salary',
      render: (value) => (
        <div className="font-semibold text-green-600">
          {formatCurrency(value)}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'remarks',
      header: 'Remarks',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value || '-'}
        </div>
      ),
      sortable: true,
    },
  ];


  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={fetchPayrolls} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DataTable
        data={payrolls}
        columns={columns}
        loading={loading}
        searchable={false}
      />
    </div>
  );
}
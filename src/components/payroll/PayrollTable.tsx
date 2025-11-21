import React, { useState, useEffect } from 'react';
import { DataTable, Column, TableAction } from '@/components/common/DataTable';
import { Payroll } from '@/types/payroll';
import { PayrollService } from '@/services/payrollService';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Pagination, LoadingSpinner, EmptyState } from '@/components/common';
import { DollarSign, Download, Eye } from 'lucide-react';
import { PayrollPreviewDialog } from './PayrollPreviewDialog';
import { useToast } from '@/hooks/use-toast';

interface PayrollTableProps {
  payrollCycleId?: string | null;
  searchTerm?: string;
}

export function PayrollTable({ payrollCycleId, searchTerm = '' }: PayrollTableProps) {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewPayrollId, setPreviewPayrollId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams: any = {
        page: currentPage,
        page_size: pageSize
      };

      // Add search parameter if searchTerm exists
      if (searchTerm && searchTerm.trim()) {
        requestParams.search = {
          keys: ["employee.name", "employee.code"],
          value: searchTerm.trim()
        };
      }
      
      let response;
      if (payrollCycleId) {
        response = await PayrollService.getPayrollsByCycle(payrollCycleId, requestParams);
      } else {
        response = await PayrollService.getPayrolls(requestParams);
      }
      
      setPayrolls(response.data);
      setTotalCount(response.total_count || 0);
      setPageCount(response.page_count || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payrolls');
      console.error('Error fetching payrolls:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (searchTerm !== undefined) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchPayrolls();
  }, [payrollCycleId, currentPage, pageSize, searchTerm]);

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

  const handleDownload = async (payroll: Payroll) => {
    try {
      setDownloadingId(payroll.id);
      const htmlContent = await PayrollService.downloadPayroll(payroll.id);
      
      // Create a blob from the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payroll-${payroll.employee?.code || payroll.id}-${format(new Date(), 'yyyy-MM-dd')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Payroll downloaded successfully',
      });
    } catch (error: any) {
      console.error('Error downloading payroll:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to download payroll',
        variant: 'destructive',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreview = async (payroll: Payroll) => {
    try {
      setPreviewPayrollId(payroll.id);
      const htmlContent = await PayrollService.downloadPayroll(payroll.id);
      setPreviewHtml(htmlContent);
      setPreviewDialogOpen(true);
    } catch (error: any) {
      console.error('Error previewing payroll:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to preview payroll',
        variant: 'destructive',
      });
    } finally {
      setPreviewPayrollId(null);
    }
  };

  const actions: TableAction<Payroll>[] = [
    {
      label: 'Preview',
      icon: Eye,
      onClick: handlePreview,
    },
    {
      label: 'Download',
      icon: Download,
      onClick: handleDownload,
    },
  ];

  const columns: Column<Payroll>[] = [
    {
      key: 'employee',
      header: 'Employee',
      align: 'left',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.employee?.name || 'Unknown'}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{row.employee?.code || '-'}</div>
        </div>
      ),
    },
    {
      key: 'working_days',
      header: 'Working Days',
      align: 'center',
      render: (value) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {value}
        </div>
      ),
    },
    {
      key: 'absent_days',
      header: 'Absent Days',
      align: 'center',
      render: (value) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {value}
        </div>
      ),
    },
    {
      key: 'leave_days',
      header: 'Leave Days',
      align: 'center',
      render: (value) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {value}
        </div>
      ),
    },
    {
      key: 'unpaid_leave_days',
      header: 'Unpaid Leave',
      align: 'center',
      render: (value) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {value}
        </div>
      ),
    },
    {
      key: 'overtime_hours',
      header: 'Overtime (hrs)',
      align: 'center',
      render: (value) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {value}
        </div>
      ),
    },
    {
      key: 'net_salary',
      header: 'Net Salary',
      align: 'center',
      render: (value) => (
        <div className="text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
          {formatCurrency(value)}
        </div>
      ),
    },
    {
      key: 'remarks',
      header: 'Remarks',
      align: 'left',
      render: (value) => (
        <div className="text-sm text-gray-700 dark:text-gray-300 max-w-[200px] truncate" title={value}>
          {value || '-'}
        </div>
      ),
    },
  ];


  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchPayrolls} 
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (totalCount === 0 && !payrollCycleId) {
    return (
      <EmptyState
        icon={DollarSign}
        title="No payroll records found"
        description="Payroll records will appear here once they are processed for a payroll cycle."
      />
    );
  }

  if (totalCount === 0 && payrollCycleId) {
    return (
      <EmptyState
        icon={DollarSign}
        title="No payroll records for this cycle"
        description="No payroll has been processed for the selected cycle yet."
      />
    );
  }

  return (
    <div className="space-y-6">
      <DataTable
        data={payrolls}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable={false}
      />
      
      {/* Pagination */}
      {totalCount > 0 && (
        <Card>
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

      {/* Preview Dialog */}
      <PayrollPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        htmlContent={previewHtml}
        payrollId={previewPayrollId || undefined}
      />
    </div>
  );
}
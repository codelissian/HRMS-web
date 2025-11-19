import React from 'react';
import { DataTable, Column, TableAction } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface LeaveRequest {
  id: string;
  employee?: {
    name: string;
    email: string;
    code: string;
    mobile: string;
  };
  leave_type_name?: string;
  leave?: {
    name: string;
  };
  reason: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: string;
  created_at: string;
}

interface LeaveRequestTableProps {
  leaveRequests: LeaveRequest[];
  loading?: boolean;
  onView: (id: string) => void;
  onApprove: (id: string, employeeName: string) => void;
  onReject: (id: string, employeeName: string) => void;
  onRowClick?: (request: LeaveRequest) => void;
}

export function LeaveRequestTable({
  leaveRequests,
  loading = false,
  onView,
  onApprove,
  onReject,
  onRowClick
}: LeaveRequestTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, icon: Clock, text: 'Pending', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      APPROVED: { variant: 'default' as const, icon: CheckCircle, text: 'Approved', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      REJECTED: { variant: 'destructive' as const, icon: XCircle, text: 'Rejected', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      CANCELLED: { variant: 'outline' as const, icon: AlertCircle, text: 'Cancelled', className: '' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`inline-flex items-center gap-1 px-2 py-1 ${config.className}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const columns: Column<LeaveRequest>[] = [
    {
      key: 'employee',
      header: 'Employee',
      align: 'left',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.employee?.name || 'Unknown Employee'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.employee?.code || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      align: 'left',
      render: (value, row) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {row.employee?.email || 'No email'}
        </div>
      ),
    },
    {
      key: 'leave_type_name',
      header: 'Leave Type',
      align: 'left',
      render: (value, row) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-white">
            {row.leave_type_name || row.leave?.name || 'Unknown'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={row.reason}>
            {row.reason}
          </div>
        </div>
      ),
    },
    {
      key: 'start_date',
      header: 'Duration',
      align: 'left',
      render: (value, row) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
            {new Date(row.start_date).toLocaleDateString()} - {new Date(row.end_date).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.total_days} day{row.total_days > 1 ? 's' : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'created_at',
      header: 'Applied Date',
      align: 'center',
      render: (value) => (
        <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
  ];

  const getActions = (row: LeaveRequest): TableAction<LeaveRequest>[] => {
    const actions: TableAction<LeaveRequest>[] = [
      {
        label: 'View',
        icon: Eye,
        onClick: (request) => onView(request.id),
      },
    ];

    if (row.status === 'PENDING') {
      actions.push(
        {
          label: 'Approve',
          icon: CheckCircle,
          onClick: (request) => onApprove(request.id, request.employee?.name || 'Unknown Employee'),
          variant: 'default',
        },
        {
          label: 'Reject',
          icon: XCircle,
          onClick: (request) => onReject(request.id, request.employee?.name || 'Unknown Employee'),
          variant: 'destructive',
        }
      );
    }

    return actions;
  };

  return (
    <DataTable
      data={leaveRequests}
      columns={columns}
      actions={(row) => getActions(row)}
      loading={loading}
      searchable={false}
      filterable={false}
      onRowClick={onRowClick}
    />
  );
}


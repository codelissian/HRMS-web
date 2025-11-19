import React from 'react';
import { DataTable, Column, TableAction } from '@/components/common/DataTable';
import { Leave } from '@/types/database';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LeaveTableProps {
  leaves: Leave[];
  loading?: boolean;
  onEdit: (leave: Leave) => void;
  onDelete: (leave: Leave) => void;
}

export function LeaveTable({
  leaves,
  loading = false,
  onEdit,
  onDelete
}: LeaveTableProps) {
  const getAccrualMethodLabel = (method: string | undefined) => {
    switch (method) {
      case 'MONTHLY': return 'Monthly';
      case 'YEARLY': return 'Yearly';
      case 'QUARTERLY': return 'Quarterly';
      case 'NONE': return 'No Accrual';
      default: return method || 'N/A';
    }
  };

  const columns: Column<Leave>[] = [
    {
      key: 'name',
      header: 'Leave Type',
      align: 'left',
      render: (_, leave) => (
        <div className="flex items-center gap-3">
          {leave.icon && (
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: leave.color || '#6B7280' }}
            >
              {leave.icon}
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {leave.name}
            </div>
            {leave.code && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {leave.code}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      align: 'left',
      render: (_, leave) => (
        <div className="text-sm text-gray-900 dark:text-white max-w-md truncate" title={leave.description || ''}>
          {leave.description || '-'}
        </div>
      ),
    },
    {
      key: 'accrual_method',
      header: 'Accrual',
      align: 'center',
      render: (_, leave) => (
        <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
          {leave.accrual_method === 'NONE' ? (
            'No Accrual'
          ) : (
            `${leave.accrual_rate || 0} days ${getAccrualMethodLabel(leave.accrual_method).toLowerCase()}`
          )}
        </div>
      ),
    },
    {
      key: 'initial_balance',
      header: 'Initial Balance',
      align: 'center',
      render: (_, leave) => (
        <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
          {leave.initial_balance !== undefined ? `${leave.initial_balance} days` : '-'}
        </div>
      ),
    },
    {
      key: 'active_flag',
      header: 'Status',
      align: 'center',
      render: (_, leave) => (
        <Badge 
          variant={leave.active_flag ? 'default' : 'secondary'}
          className={leave.active_flag ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
        >
          {leave.active_flag ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const actions: TableAction<Leave>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: onEdit,
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: onDelete,
      variant: 'destructive',
    },
  ];

  return (
    <DataTable
      data={leaves}
      columns={columns}
      actions={actions}
      loading={loading}
      searchable={false}
      filterable={false}
    />
  );
}


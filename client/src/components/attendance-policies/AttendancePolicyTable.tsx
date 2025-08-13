import React from 'react';
import { DataTable, Column, TableAction } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { AttendancePolicy } from '@/types/attendance';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface AttendancePolicyTableProps {
  policies: AttendancePolicy[];
  loading?: boolean;
  onView: (policy: AttendancePolicy) => void;
  onEdit: (policy: AttendancePolicy) => void;
  onDelete: (policy: AttendancePolicy) => void;
}

export function AttendancePolicyTable({
  policies,
  loading = false,
  onView,
  onEdit,
  onDelete
}: AttendancePolicyTableProps) {

  const getStatusColor = (active: boolean) => {
    return active ? 'default' : 'secondary';
  };

  const getStatusText = (active: boolean) => {
    return active ? 'Active' : 'Inactive';
  };

  const columns: Column<AttendancePolicy>[] = [
    {
      key: 'name',
      header: 'Policy Name',
      render: (_, policy) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900 dark:text-white">
            {policy.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            ID: {policy.id.slice(0, 8)}...
          </div>
        </div>
      ),
    },
    {
      key: 'active_flag',
      header: 'Status',
      render: (active) => (
        <Badge 
          variant={getStatusColor(active)}
          className={active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
        >
          {getStatusText(active)}
        </Badge>
      ),
    },
    {
      key: 'grace_period_minutes',
      header: 'Grace Period',
      render: (value) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {value} min
        </span>
      ),
    },
    {
      key: 'overtime_threshold_hours',
      header: 'Overtime Threshold',
      render: (value) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {value} hrs
        </span>
      ),
    },
    {
      key: 'geo_tracking_enabled',
      header: 'Features',
      render: (_, policy) => (
        <div className="flex flex-wrap gap-1">
          {policy.geo_tracking_enabled && (
            <Badge variant="outline" className="text-xs">
              Geo-tracking
            </Badge>
          )}
          {policy.selfie_required && (
            <Badge variant="outline" className="text-xs">
              Selfie
            </Badge>
          )}
          {policy.break_management_enabled && (
            <Badge variant="outline" className="text-xs">
              Break Mgmt
            </Badge>
          )}
          {policy.regularization_enabled && (
            <Badge variant="outline" className="text-xs">
              Regularization
            </Badge>
          )}
        </div>
      ),
    },
  ];

  const actions: TableAction<AttendancePolicy>[] = [
    {
      label: 'View',
      icon: Eye,
      onClick: onView,
    },
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
      data={policies}
      columns={columns}
      actions={actions}
      loading={loading}
      searchable={false}
      filterable={false}
    />
  );
}

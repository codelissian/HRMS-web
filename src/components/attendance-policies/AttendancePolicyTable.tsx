import React from 'react';
import { DataTable, Column, TableAction } from '@/components/common/DataTable';
import { AttendancePolicy } from '@/types/attendance';
import { Edit, Trash2 } from 'lucide-react';

interface AttendancePolicyTableProps {
  policies: AttendancePolicy[];
  loading?: boolean;
  onEdit: (policy: AttendancePolicy) => void;
  onDelete: (policy: AttendancePolicy) => void;
}

export function AttendancePolicyTable({
  policies,
  loading = false,
  onEdit,
  onDelete
}: AttendancePolicyTableProps) {




  const columns: Column<AttendancePolicy>[] = [
    {
      key: 'name',
      header: 'Policy Name',
      align: 'left',
      render: (_, policy) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {policy.name}
        </div>
      ),
    },
    {
      key: 'geo_tracking_enabled',
      header: 'Geo Tracking',
      align: 'center',
      render: (_, policy) => (
        <div className="text-sm text-gray-900 dark:text-white">
          <span>{policy.geo_tracking_enabled ? 'Enabled' : 'Disabled'}</span>
          {policy.geo_tracking_enabled && policy.geo_radius_meters && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ({policy.geo_radius_meters}m radius)
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'selfie_required',
      header: 'Selfie Required',
      align: 'center',
      render: (_, policy) => (
        <span className="block text-sm text-gray-900 dark:text-white">
          {policy.selfie_required ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'web_attendance_enabled',
      header: 'Web Attendance',
      align: 'center',
      render: (_, policy) => (
        <span className="block text-sm text-gray-900 dark:text-white">
          {policy.web_attendance_enabled ? 'Enabled' : 'Disabled'}
        </span>
      ),
    },
    {
      key: 'mobile_attendance_enabled',
      header: 'Mobile Attendance',
      align: 'center',
      render: (_, policy) => (
        <span className="block text-sm text-gray-900 dark:text-white">
          {policy.mobile_attendance_enabled ? 'Enabled' : 'Disabled'}
        </span>
      ),
    },
  ];

  const actions: TableAction<AttendancePolicy>[] = [
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
      filterable={true}
    />
  );
}

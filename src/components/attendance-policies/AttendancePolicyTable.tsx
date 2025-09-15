import React from 'react';
import { DataTable, Column, TableAction } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
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
      render: (_, policy) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {policy.name}
        </div>
      ),
    },
    {
      key: 'geo_tracking_enabled',
      header: 'Geo Tracking',
      render: (_, policy) => (
        <div className="flex flex-col items-center space-y-1">
          <Badge 
            variant={policy.geo_tracking_enabled ? 'default' : 'secondary'}
            className={policy.geo_tracking_enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
          >
            {policy.geo_tracking_enabled ? 'Enabled' : 'Disabled'}
          </Badge>
          {policy.geo_tracking_enabled && policy.geo_radius_meters && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              ({policy.geo_radius_meters}m radius)
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'selfie_required',
      header: 'Selfie Required',
      render: (_, policy) => (
        <div className="flex justify-center">
          <Badge 
            variant={policy.selfie_required ? 'default' : 'secondary'}
            className={policy.selfie_required ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
          >
            {policy.selfie_required ? 'Yes' : 'No'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'web_attendance_enabled',
      header: 'Web Attendance',
      render: (_, policy) => (
        <div className="flex justify-center">
          <Badge 
            variant={policy.web_attendance_enabled ? 'default' : 'secondary'}
            className={policy.web_attendance_enabled ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : ''}
          >
            {policy.web_attendance_enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'mobile_attendance_enabled',
      header: 'Mobile Attendance',
      render: (_, policy) => (
        <div className="flex justify-center">
          <Badge 
            variant={policy.mobile_attendance_enabled ? 'default' : 'secondary'}
            className={policy.mobile_attendance_enabled ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : ''}
          >
            {policy.mobile_attendance_enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'modified_at',
      header: 'Last Modified',
      render: (_, policy) => {
        const formatDate = (dateString?: string) => {
          if (!dateString) return '-';
          try {
            return new Date(dateString).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          } catch {
            return '-';
          }
        };

        return (
          <div className="flex flex-col items-center space-y-1 text-center">
            <span className="text-sm text-gray-900 dark:text-white">
              {formatDate(policy.modified_at || policy.created_at)}
            </span>
            {policy.modified_by && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                by {policy.modified_by}
              </div>
            )}
          </div>
        );
      },
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

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
      header: 'Overtime',
      render: (value) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {value} hrs
        </span>
      ),
    },
    {
      key: 'geo_tracking_enabled',
      header: 'Location',
      render: (_, policy) => (
        <div className="space-y-1">
          {policy.geo_tracking_enabled ? (
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                GPS
              </Badge>
              <span className="text-xs text-gray-500">
                {policy.geo_radius_meters}m radius
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">Disabled</span>
          )}
        </div>
      ),
    },
    {
      key: 'web_attendance_enabled',
      header: 'Attendance Methods',
      render: (_, policy) => (
        <div className="flex flex-wrap gap-1">
          {policy.mobile_attendance_enabled && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              Mobile
            </Badge>
          )}
          {policy.web_attendance_enabled && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              Web
            </Badge>
          )}
          {!policy.mobile_attendance_enabled && !policy.web_attendance_enabled && (
            <span className="text-xs text-gray-400">None</span>
          )}
        </div>
      ),
    },
    {
      key: 'selfie_required',
      header: 'Features',
      render: (_, policy) => (
        <div className="flex flex-wrap gap-1">
          {policy.selfie_required && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              Selfie
            </Badge>
          )}
          {policy.break_management_enabled && (
            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
              Break Mgmt
            </Badge>
          )}
          {policy.regularization_enabled && (
            <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
              Regularization
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Last Modified',
      render: (_, policy) => (
        <div className="space-y-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(policy.modified_at || policy.created_at)}
          </span>
          {policy.modified_by && (
            <div className="text-xs text-gray-400">
              by {policy.modified_by}
            </div>
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
      filterable={true}
    />
  );
}

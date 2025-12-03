import React from 'react';
import { DataTable, Column, TableAction } from '@/components/common/DataTable';
import { ShiftSummary } from '@/contexts/ShiftsContext';
import { Edit, Trash2, UserPlus } from 'lucide-react';

interface ShiftTableProps {
  shifts: ShiftSummary[];
  loading?: boolean;
  onEdit: (shift: ShiftSummary) => void;
  onDelete: (shift: ShiftSummary) => void;
  onAssignEmployees?: (shift: ShiftSummary) => void;
}

export function ShiftTable({
  shifts,
  loading = false,
  onEdit,
  onDelete,
  onAssignEmployees
}: ShiftTableProps) {
  const columns: Column<ShiftSummary>[] = [
    {
      key: 'name',
      header: 'Shift Name',
      align: 'left',
      render: (_, shift) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {shift.name}
        </div>
      ),
    },
    {
      key: 'start',
      header: 'Start Time',
      align: 'center',
      render: (_, shift) => {
        // Format time - handle both HH:MM format and ISO format
        const formatTime = (timeString: string) => {
          if (!timeString) return '-';
          // If it's already in HH:MM format, return as is
          if (timeString.match(/^\d{2}:\d{2}$/)) {
            return timeString;
          }
          // If it's ISO format, extract time
          try {
            const date = new Date(timeString);
            return date.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            });
          } catch {
            return timeString;
          }
        };

        return (
          <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
            {formatTime(shift.start)}
          </div>
        );
      },
    },
    {
      key: 'end',
      header: 'End Time',
      align: 'center',
      render: (_, shift) => {
        // Format time - handle both HH:MM format and ISO format
        const formatTime = (timeString: string) => {
          if (!timeString) return '-';
          // If it's already in HH:MM format, return as is
          if (timeString.match(/^\d{2}:\d{2}$/)) {
            return timeString;
          }
          // If it's ISO format, extract time
          try {
            const date = new Date(timeString);
            return date.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            });
          } catch {
            return timeString;
          }
        };

        return (
          <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
            {formatTime(shift.end)}
          </div>
        );
      },
    },
    {
      key: 'grace_minutes',
      header: 'Grace Period',
      align: 'center',
      render: (_, shift) => (
        <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
          {shift.grace_minutes} min
        </div>
      ),
    },
  ];

  const actions: TableAction<ShiftSummary>[] = [
    ...(onAssignEmployees ? [{
      label: 'Assign Employees',
      icon: UserPlus,
      onClick: onAssignEmployees,
    }] : []),
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
      data={shifts}
      columns={columns}
      actions={actions}
      loading={loading}
      searchable={false}
      filterable={false}
    />
  );
}


import React from 'react';
import { DataTable, Column, TableAction } from '@/components/common/DataTable';
import { Holiday } from '@/types/holiday';
import { Edit, Trash2, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HolidayTableProps {
  holidays: Holiday[];
  loading?: boolean;
  onEdit: (holiday: Holiday) => void;
  onDelete: (holiday: Holiday) => void;
}

export function HolidayTable({
  holidays,
  loading = false,
  onEdit,
  onDelete
}: HolidayTableProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const columns: Column<Holiday>[] = [
    {
      key: 'name',
      header: 'Holiday Name',
      align: 'left',
      render: (_, holiday) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {holiday.name}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      align: 'left',
      render: (_, holiday) => (
        <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
          {formatDate(holiday.date)}
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      align: 'left',
      render: (_, holiday) => (
        <div className="text-sm text-gray-900 dark:text-white max-w-md truncate" title={holiday.description}>
          {holiday.description || '-'}
        </div>
      ),
    },
    {
      key: 'is_recurring',
      header: 'Type',
      align: 'center',
      render: (_, holiday) => (
        holiday.is_recurring ? (
          <Badge variant="secondary" className="flex items-center gap-1 w-fit mx-auto">
            <RotateCcw className="h-3 w-3" />
            Recurring
          </Badge>
        ) : (
          <Badge variant="outline" className="mx-auto w-fit">One-time</Badge>
        )
      ),
    },
    {
      key: 'active_flag',
      header: 'Status',
      align: 'center',
      render: (_, holiday) => (
        <Badge 
          variant={holiday.active_flag ? 'default' : 'secondary'}
          className={holiday.active_flag ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
        >
          {holiday.active_flag ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const actions: TableAction<Holiday>[] = [
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
      data={holidays}
      columns={columns}
      actions={actions}
      loading={loading}
      searchable={false}
      filterable={false}
    />
  );
}

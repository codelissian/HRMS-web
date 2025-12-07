import React from 'react';
import { DataTable, Column, TableAction } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { WorkDayRule } from '@/types/workDayRule';
import { Edit, Trash2 } from 'lucide-react';

interface WorkDayRuleTableProps {
  workDayRules: WorkDayRule[];
  loading?: boolean;
  onEdit?: (workDayRule: WorkDayRule) => void;
  onDelete?: (workDayRule: WorkDayRule) => void;
}

export function WorkDayRuleTable({ 
  workDayRules, 
  loading = false, 
  onEdit, 
  onDelete
}: WorkDayRuleTableProps) {
  const getWorkweekLabel = (workweek: string) => {
    switch (workweek) {
      case 'five_days':
        return '5 Days';
      case 'six_days':
        return '6 Days';
      case 'seven_days':
        return '7 Days';
      default:
        return workweek;
    }
  };

  const getPayrollDays = (workDayRule: WorkDayRule) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const payrollDays = days.filter(day => {
      const payrollKey = `include_${day}_in_payroll` as keyof WorkDayRule;
      return workDayRule[payrollKey];
    });
    
    return payrollDays.map(day => {
      const index = days.indexOf(day);
      return dayNames[index];
    }).join(', ');
  };

  const columns: Column<WorkDayRule>[] = [
    {
      key: 'name',
      header: 'Rule Name',
      align: 'left',
      render: (_, rule) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {rule.name}
        </div>
      ),
    },
    {
      key: 'workweek',
      header: 'Work Week',
      align: 'center',
      render: (_, rule) => (
        <div className="flex justify-center">
          <Badge variant="default">
            {getWorkweekLabel(rule.workweek)}
          </Badge>
        </div>
      ),
    },
    {
      key: 'payroll_days',
      header: 'Payroll Days',
      align: 'center',
      render: (_, rule) => (
        <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
          {getPayrollDays(rule)}
        </div>
      ),
    },
  ];

  const actions: TableAction<WorkDayRule>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: onEdit || (() => {}),
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: onDelete || (() => {}),
      variant: 'destructive',
    },
  ];

  return (
    <DataTable
      data={workDayRules}
      columns={columns}
      actions={actions}
      loading={loading}
      searchable={false}
      filterable={false}
    />
  );
}
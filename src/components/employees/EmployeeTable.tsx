import { DataTable, Column, TableAction } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Employee, EmployeeWithRelations } from '../../types/database';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface EmployeeTableProps {
  employees: EmployeeWithRelations[];
  loading?: boolean;
  onView: (employee: EmployeeWithRelations) => void;
  onEdit: (employee: EmployeeWithRelations) => void;
  onDelete: (employee: EmployeeWithRelations) => void;
}

export function EmployeeTable({ 
  employees, 
  loading = false, 
  onView, 
  onEdit, 
  onDelete 
}: EmployeeTableProps) {
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const columns: Column<EmployeeWithRelations>[] = [
    {
      key: 'name',
      header: 'Employee',
      render: (_, employee) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-white">
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {employee.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {employee.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'department_id',
      header: 'Department',
      render: (value, employee) => {
        if (!value) return '-';
        return employee.department?.name || value;
      },
    },
    {
      key: 'designation_id',
      header: 'Designation',
      render: (value, employee) => {
        if (!value) return '-';
        return employee.designation?.name || value;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (status) => (
        <Badge 
          variant={status === 'active' ? 'default' : 'secondary'}
          className={status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
        >
          {status || 'Active'}
        </Badge>
      ),
    },
    {
      key: 'joining_date',
      header: 'Joining Date',
      render: (date) => date ? format(new Date(date), 'MMM dd, yyyy') : '-',
    },
  ];

  const actions: TableAction<EmployeeWithRelations>[] = [
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
      data={employees}
      columns={columns}
      actions={actions}
      loading={loading}
    />
  );
}

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
      key: 'id',
      header: 'Employee ID',
      align: 'left',
      render: (_, employee) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {(employee as any).code || employee.id?.slice(-4) || 'N/A'}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      align: 'left',
      render: (_, employee) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-white">
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {employee.name}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      align: 'left',
      render: (_, employee) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {employee.email || '-'}
        </div>
      ),
    },
    {
      key: 'department_id',
      header: 'Department',
      align: 'left',
      render: (value, employee) => {
        if (!value) return <span className="text-sm text-gray-500 dark:text-gray-400">-</span>;
        return (
          <div className="text-sm text-gray-900 dark:text-white">
            {employee.department?.name || value}
          </div>
        );
      },
    },
    {
      key: 'designation_id',
      header: 'Designation',
      align: 'left',
      render: (value, employee) => {
        if (!value) return <span className="text-sm text-gray-500 dark:text-gray-400">-</span>;
        return (
          <div className="text-sm text-gray-900 dark:text-white">
            {employee.designation?.name || value}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (status, employee) => {
        const isActive = employee.active_flag === true || employee.active_flag === undefined;
        return (
          <Badge 
            variant={isActive ? 'default' : 'secondary'}
            className={isActive 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 inline-flex px-2 py-1' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 inline-flex px-2 py-1'
            }
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      key: 'joining_date',
      header: 'Joining Date',
      align: 'left',
      render: (date) => (
        <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
          {date ? format(new Date(date), 'MMM dd, yyyy') : '-'}
        </div>
      ),
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
      onRowClick={onView}
    />
  );
}

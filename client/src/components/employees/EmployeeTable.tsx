import { DataTable, Column, TableAction } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Employee } from '@shared/schema';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { departmentService } from '@/services/departmentService';
import { designationService } from '@/services/designationService';

interface EmployeeTableProps {
  employees: Employee[];
  loading?: boolean;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeTable({ 
  employees, 
  loading = false, 
  onView, 
  onEdit, 
  onDelete 
}: EmployeeTableProps) {
  
  // State for department and designation names
  const [departmentNames, setDepartmentNames] = useState<Record<string, string>>({});
  const [designationNames, setDesignationNames] = useState<Record<string, string>>({});
  const [isLoadingNames, setIsLoadingNames] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Fetch department and designation names
  useEffect(() => {
    const fetchNames = async () => {
      if (employees.length === 0) return;
      
      setIsLoadingNames(true);
      try {
        // Get unique department and designation IDs
        const deptIds = [...new Set(employees.map(emp => emp.department_id).filter(Boolean))];
        const desigIds = [...new Set(employees.map(emp => emp.designation_id).filter(Boolean))];
        
        // Fetch departments
        if (deptIds.length > 0) {
          const deptResponse = await departmentService.getDepartments({
            page: 1,
            page_size: 1000
          });
          
          if (deptResponse.data) {
            const deptMap: Record<string, string> = {};
            deptResponse.data.forEach(dept => {
              deptMap[dept.id] = dept.name;
            });
            setDepartmentNames(deptMap);
          }
        }
        
        // Fetch designations
        if (desigIds.length > 0) {
          const desigResponse = await designationService.getDesignations({
            page: 1,
            page_size: 1000
          });
          
          if (desigResponse.data) {
            const desigMap: Record<string, string> = {};
            desigResponse.data.forEach(desig => {
              desigMap[desig.id] = desig.name;
            });
            setDesignationNames(desigMap);
          }
        }
      } catch (error) {
        console.error('Error fetching names:', error);
      } finally {
        setIsLoadingNames(false);
      }
    };
    
    fetchNames();
  }, [employees]);

  const columns: Column<Employee>[] = [
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
        if (isLoadingNames) return 'Loading...';
        return departmentNames[value] || value;
      },
    },
    {
      key: 'designation_id',
      header: 'Designation',
      render: (value, employee) => {
        if (!value) return '-';
        if (isLoadingNames) return 'Loading...';
        return designationNames[value] || value;
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

  const actions: TableAction<Employee>[] = [
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

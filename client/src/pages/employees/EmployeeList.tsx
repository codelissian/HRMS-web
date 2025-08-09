import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import { useApiCall } from '@/hooks/useApi';
import { employeeService } from '@/services/employeeService';
import { Employee, InsertEmployee } from '@shared/schema';
import { Plus, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function EmployeeList() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { execute: createEmployee, loading: creating } = useApiCall<Employee>();
  const { execute: updateEmployee, loading: updating } = useApiCall<Employee>();
  const { execute: deleteEmployee, loading: deleting } = useApiCall<void>();

  // Fetch employees
  const { 
    data: employeesResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/employees/list', { 
      page: 1, 
      page_size: 50, 
      search: searchTerm,
      department: departmentFilter,
      status: statusFilter 
    }],
    queryFn: () => employeeService.getEmployees({
      page: 1,
      page_size: 50,
      search: searchTerm,
      department_id: departmentFilter,
      status: statusFilter,
    }),
  });

  const employees = employeesResponse?.data || [];

  const handleCreateEmployee = async (data: InsertEmployee) => {
    const result = await createEmployee('/employees/create', 'POST', data);
    if (result) {
      toast({
        title: 'Success',
        description: 'Employee created successfully',
      });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['/employees/list'] });
    }
  };

  const handleViewEmployee = (employee: Employee) => {
    // Implement view logic
    console.log('View employee:', employee);
  };

  const handleEditEmployee = (employee: Employee) => {
    // Implement edit logic
    console.log('Edit employee:', employee);
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const result = await deleteEmployee('/employees/delete', 'PATCH', { id: employee.id });
      if (result !== null) {
        toast({
          title: 'Success',
          description: 'Employee deleted successfully',
        });
        queryClient.invalidateQueries({ queryKey: ['/employees/list'] });
      }
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">
          Error loading employees: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Employees
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your organization's employees
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  <SelectItem value="dept-1">Engineering</SelectItem>
                  <SelectItem value="dept-2">HR</SelectItem>
                  <SelectItem value="dept-3">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <EmployeeTable
        employees={employees}
        loading={isLoading}
        onView={handleViewEmployee}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
      />

      {/* Employee Form Modal */}
      <EmployeeForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleCreateEmployee}
        loading={creating}
      />
    </div>
  );
}

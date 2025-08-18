import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import { ConfirmationDialog } from '@/components/common';
import { employeeService } from '@/services/employeeService';
import { Employee, InsertEmployee } from '@shared/schema';
import { Plus, Filter, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export default function EmployeeList() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  
  // Confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  
  // Edit employee state
  const [isEditMode, setIsEditMode] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [isLoadingEditData, setIsLoadingEditData] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch employees with proper filtering
  const { 
    data: employeesResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['employees', 'list', { 
      page: currentPage, 
      page_size: pageSize, 
      search: searchTerm,
      department_id: departmentFilter,
      status: statusFilter 
    }],
    queryFn: () => employeeService.getEmployees({
      page: currentPage,
      page_size: pageSize,
      search: searchTerm || undefined,
      department_id: departmentFilter === 'all' ? undefined : departmentFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
    }),
  });

  const employees = employeesResponse?.data || [];
  const totalCount = employeesResponse?.total_count || 0;
  const pageCount = employeesResponse?.page_count || 0;

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: (data: InsertEmployee) => employeeService.createEmployee(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Employee created successfully',
      });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['employees', 'list'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create employee',
        variant: 'destructive',
      });
    },
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: (data: Partial<Employee> & { id: string }) => employeeService.updateEmployee(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Employee updated successfully',
      });
      setShowForm(false);
      setIsEditMode(false);
      setEmployeeToEdit(null);
      queryClient.invalidateQueries({ queryKey: ['employees', 'list'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update employee',
        variant: 'destructive',
      });
    },
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: (id: string) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['employees', 'list'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete employee',
        variant: 'destructive',
      });
    },
  });

  const handleCreateEmployee = async (data: InsertEmployee) => {
    createEmployeeMutation.mutate(data);
  };

  const handleUpdateEmployee = async (data: InsertEmployee) => {
    if (employeeToEdit) {
      updateEmployeeMutation.mutate({
        id: employeeToEdit.id,
        ...data
      });
    }
  };

  const handleViewEmployee = (employee: Employee) => {
    navigate(`/admin/employees/${employee.id}`);
  };

  const handleEditEmployee = async (employee: Employee) => {
    try {
      setIsEditMode(true);
      setShowForm(true);
      setIsLoadingEditData(true);
      
      // Fetch complete employee data for editing
      const response = await employeeService.getEmployee(employee.id);
      if (response.status && response.data) {
        setEmployeeToEdit(response.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch employee details for editing',
          variant: 'destructive',
        });
        // Close form if data fetch failed
        setShowForm(false);
        setIsEditMode(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch employee details for editing',
        variant: 'destructive',
      });
      // Close form if data fetch failed
      setShowForm(false);
      setIsEditMode(false);
    } finally {
      setIsLoadingEditData(false);
    }
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    if (employeeToDelete) {
      deleteEmployeeMutation.mutate(employeeToDelete.id);
    }
  };

  const handleExportEmployees = async () => {
    try {
      const blob = await employeeService.exportEmployees({
        page: 1,
        page_size: totalCount,
        search: searchTerm || undefined,
        department_id: departmentFilter === 'all' ? undefined : departmentFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `employees-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Employees exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export employees',
        variant: 'destructive',
      });
    }
  };

  const handleBulkImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await employeeService.bulkImport(file);
      if (result) {
        const { success_count, error_count } = result.data;
        toast({
          title: 'Success',
          description: `Imported ${success_count} employees successfully${error_count > 0 ? `, ${error_count} errors` : ''}`,
        });
        queryClient.invalidateQueries({ queryKey: ['employees', 'list'] });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import employees',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">
          Error loading employees: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportEmployees}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <label htmlFor="bulk-import">
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </span>
                </Button>
              </label>
              <input
                id="bulk-import"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleBulkImport}
                className="hidden"
              />
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <SelectItem value="all">All Departments</SelectItem>
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
                  <SelectItem value="all">All Status</SelectItem>
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

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} employees
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={currentPage === pageCount}
              onClick={() => setCurrentPage(prev => Math.min(pageCount, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Employee Form Modal */}
              <EmployeeForm
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) {
              setIsEditMode(false);
              setEmployeeToEdit(null);
            }
          }}
          onSubmit={isEditMode ? handleUpdateEmployee : handleCreateEmployee}
          loading={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
          initialData={isEditMode ? employeeToEdit : undefined}
          title={isEditMode ? 'Edit Employee' : 'Add New Employee'}
          description={isEditMode ? 'Update the employee details below.' : 'Fill in the employee details below.'}
          isEditMode={isEditMode}
        />
        
        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Employee"
          description="Are you sure you want to delete this employee? This action cannot be undone."
          type="delete"
          confirmText="Delete Employee"
          onConfirm={confirmDeleteEmployee}
          loading={deleteEmployeeMutation.isPending}
          itemName={employeeToDelete?.name}
        />
      </div>
    );
  }

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { ConfirmationDialog, Pagination, LoadingSpinner, EmptyState } from '@/components/common';
import { employeeService } from '@/services/employeeService';
import { Employee, EmployeeWithRelations } from '../../types/database';
import { Plus, Download, Upload, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getOrganisationId } from '@/lib/shift-utils';
import { authToken } from '@/services/authToken';

export default function EmployeeList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeWithRelations | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Get organisation_id from user, with multiple fallbacks
  const organisationId = useMemo(() => {
    const fromUser = user?.organisation_id;
    const fromStorage = getOrganisationId();
    const fromAuthToken = authToken.getorganisationId();
    
    // Try all sources in order of preference
    const orgId = fromUser || fromStorage || fromAuthToken || '';
    
    return orgId;
  }, [user]);

  // Fetch employees with proper filtering and include department/designation data
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
    queryFn: () => {
      if (!organisationId) {
        throw new Error('Organization ID not found');
      }
      
      return employeeService.getEmployees({
        organisation_id: organisationId,
        page: currentPage,
        page_size: pageSize,
        search: searchTerm || undefined,
        department_id: departmentFilter === 'all' ? undefined : departmentFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        include: ['department', 'designation', 'shift']
      });
    },
    enabled: !!organisationId && !authLoading,
  });

  const employees = employeesResponse?.data || [];
  const totalCount = employeesResponse?.total_count || 0;
  const pageCount = employeesResponse?.page_count || 0;


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

  const handleViewEmployee = (employee: Employee) => {
    navigate(`/admin/employees/${employee.id}`);
  };

  const handleEditEmployee = (employee: Employee) => {
    navigate(`/admin/employees/${employee.id}/edit`);
  };

  const handleAddEmployee = () => {
    navigate('/admin/employees/new');
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
    if (!organisationId) {
      toast({
        title: 'Error',
        description: 'Organization ID not found',
        variant: 'destructive',
      });
      return;
    }

    try {
      const blob = await employeeService.exportEmployees({
        organisation_id: organisationId,
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

    // Validate file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a CSV file (.csv)',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await employeeService.bulkImport(file);
      
      // Check if the response has the expected structure
      if (result && result.data) {
        const { success_count, error_count } = result.data;
        toast({
          title: 'Success',
          description: `Imported ${success_count} employees successfully${error_count > 0 ? `, ${error_count} errors` : ''}`,
        });
        queryClient.invalidateQueries({ queryKey: ['employees', 'list'] });
      } else if (result && result.status) {
        // If the response has a different structure but indicates success
        toast({
          title: 'Success',
          description: 'Employees imported successfully',
        });
        queryClient.invalidateQueries({ queryKey: ['employees', 'list'] });
      } else {
        // If no clear success indication, assume it worked and refresh
        toast({
          title: 'Success',
          description: 'File uploaded successfully',
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportEmployees}>
            <Upload className="h-4 w-4 mr-2" />
            Export
          </Button>
          <label htmlFor="bulk-import">
            <Button variant="outline" asChild>
              <span>
                <Download className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
          </label>
          <input
            id="bulk-import"
            type="file"
            accept=".csv"
            onChange={handleBulkImport}
            className="hidden"
          />
          <Button onClick={handleAddEmployee} className="bg-[#0B2E5C] hover:bg-[#0B2E5C]/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh] w-full">
          <LoadingSpinner />
        </div>
      ) : totalCount > 0 ? (
        <>
      {/* Employee Table */}
      <EmployeeTable
        employees={employees}
        loading={isLoading}
        onView={handleViewEmployee}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
      />

      {/* Pagination */}
          {totalCount > 0 && (
            <Card>
              <CardContent className="p-4">
                <Pagination
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalCount={totalCount}
                  pageCount={pageCount}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(newPageSize) => {
                    setPageSize(newPageSize);
                    setCurrentPage(1);
                  }}
                  showFirstLast={false}
                />
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <EmptyState
          icon={Users}
          title="No employees found"
          description="Get started by adding your first employee. You can add employees individually or import them in bulk."
          action={{
            label: "Add Employee",
            onClick: handleAddEmployee
          }}
        />
      )}

      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Employee"
        description={`Are you sure you want to delete the employee "${employeeToDelete?.name}"? This action cannot be undone and will permanently remove the employee from the system.`}
        type="delete"
        confirmText="Delete Employee"
        onConfirm={confirmDeleteEmployee}
        loading={deleteEmployeeMutation.isPending}
        itemName={employeeToDelete?.name}
      />
    </div>
  );
}

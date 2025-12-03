import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, CheckCircle2, Circle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService, EmployeeWithRelations } from '@/services/employeeService';
import { departmentService } from '@/services/departmentService';
import { designationService } from '@/services/designationService';
import { AttendancePolicyService } from '@/services/attendancePolicyService';
import { ShiftService } from '@/services/shiftService';
import { LoadingSpinner, EmptyState } from '@/components/common';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type AssignmentType = 'department' | 'designation' | 'attendance-policy' | 'shift';

interface ItemDetails {
  id: string;
  name: string;
  [key: string]: any;
}

export default function EmployeeAssignmentPage() {
  const { type, id } = useParams<{ type: AssignmentType; id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch item details based on type
  const { data: itemResponse, isLoading: itemLoading } = useQuery({
    queryKey: ['assignment-item', type, id],
    queryFn: async () => {
      if (!type || !id) return null;

      switch (type) {
        case 'department':
          const deptResponse = await departmentService.getDepartment(id);
          return { id: deptResponse.data.id, name: deptResponse.data.name, ...deptResponse.data };
        case 'designation':
          const desigResponse = await designationService.getDesignation(id);
          return { id: desigResponse.data.id, name: desigResponse.data.name, ...desigResponse.data };
        case 'attendance-policy':
          const policyResponse = await AttendancePolicyService.getById(id);
          return { id: policyResponse.data.id, name: policyResponse.data.name, ...policyResponse.data };
        case 'shift':
          const shiftResponse = await ShiftService.getShift(id);
          return { id: shiftResponse.id, name: shiftResponse.name, ...shiftResponse };
        default:
          return null;
      }
    },
    enabled: !!type && !!id,
  });

  const itemDetails: ItemDetails | null = itemResponse || null;

  // Fetch employees
  const { data: employeesResponse, isLoading: employeesLoading, refetch: refetchEmployees } = useQuery({
    queryKey: ['employees', 'assignment', { search: debouncedSearchTerm }],
    queryFn: () => {
      const filters: any = {
        page: 1,
        page_size: 1000,
        include: ['department', 'designation', 'attendance_rule', 'shift'],
      };

      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        filters.search = {
          keys: ['name', 'email', 'code'],
          value: debouncedSearchTerm.trim(),
        };
      }

      return employeeService.getEmployees(filters);
    },
    enabled: true,
  });

  const employees = employeesResponse?.data || [];

  // Check assignment status for each employee
  const employeesWithStatus = useMemo(() => {
    if (!type || !id || !itemDetails) return [];

    return employees.map((employee) => {
      let isAssigned = false;

      switch (type) {
        case 'department':
          isAssigned = employee.department_id === id;
          break;
        case 'designation':
          isAssigned = employee.designation_id === id;
          break;
        case 'attendance-policy':
          isAssigned = employee.attendance_rule_id === id;
          break;
        case 'shift':
          isAssigned = employee.shift_id === id;
          break;
      }

      return {
        ...employee,
        isAssigned,
      };
    });
  }, [employees, type, id, itemDetails]);

  // Handle checkbox selection
  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployeeIds((prev) => [...prev, employeeId]);
    } else {
      setSelectedEmployeeIds((prev) => prev.filter((id) => id !== employeeId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployeeIds(employeesWithStatus.map((emp) => emp.id));
    } else {
      setSelectedEmployeeIds([]);
    }
  };


  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async (employeeIds: string[]) => {
      if (!type || !id) throw new Error('Invalid assignment type or ID');

      const updateData: any = {};
      switch (type) {
        case 'department':
          updateData.department_id = id;
          break;
        case 'designation':
          updateData.designation_id = id;
          break;
        case 'attendance-policy':
          updateData.attendance_rule_id = id;
          break;
        case 'shift':
          updateData.shift_id = id;
          break;
      }

      return employeeService.bulkUpdateEmployees(employeeIds, updateData);
    },
    onSuccess: (response) => {
      const count = response.data?.[0]?.count || 0;
      toast({
        title: 'Success',
        description: `Successfully assigned ${count} employee(s) to ${itemDetails?.name || 'item'}.`,
      });
      setSelectedEmployeeIds([]);
      setShowConfirmDialog(false);
      refetchEmployees();
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to assign employees. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle assign button click
  const handleAssign = () => {
    if (selectedEmployeeIds.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select at least one employee to assign.',
        variant: 'destructive',
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  // Handle confirm assignment
  const handleConfirmAssign = () => {
    bulkUpdateMutation.mutate(selectedEmployeeIds);
  };

  // Get assignment type label
  const getAssignmentTypeLabel = () => {
    switch (type) {
      case 'department':
        return 'Department';
      case 'designation':
        return 'Designation';
      case 'attendance-policy':
        return 'Attendance Policy';
      case 'shift':
        return 'Shift';
      default:
        return 'Item';
    }
  };

  // Get back navigation path
  const getBackPath = () => {
    switch (type) {
      case 'department':
        return '/admin/departments';
      case 'designation':
        return '/admin/designations';
      case 'attendance-policy':
        return '/admin/attendance-policies';
      case 'shift':
        return '/admin/shifts';
      default:
        return '/admin/dashboard';
    }
  };

  if (itemLoading || employeesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!type || !id || !itemDetails) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">Invalid assignment type or ID</p>
        <Button onClick={() => navigate('/admin/dashboard')} className="mt-4" variant="outline">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const allSelected = employeesWithStatus.length > 0 && selectedEmployeeIds.length === employeesWithStatus.length;
  const someSelected = selectedEmployeeIds.length > 0 && selectedEmployeeIds.length < employeesWithStatus.length;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search employees by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSelectAll(!allSelected)}
            disabled={employeesWithStatus.length === 0}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </div>

      {/* Employee Table */}
      {employeesWithStatus.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees found"
          description="No employees match your search criteria."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Current Department</TableHead>
                    <TableHead>Current Designation</TableHead>
                    <TableHead>Current Shift</TableHead>
                    <TableHead>Current Policy</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeesWithStatus.map((employee) => {
                    const isSelected = selectedEmployeeIds.includes(employee.id);
                    return (
                      <TableRow key={employee.id} className={isSelected ? 'bg-gray-50 dark:bg-gray-800' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectEmployee(employee.id, checked as boolean)}
                            aria-label={`Select ${employee.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.code || employee.id?.slice(-8) || 'N/A'}</TableCell>
                        <TableCell>{(employee as any).department?.name || 'N/A'}</TableCell>
                        <TableCell>{(employee as any).designation?.name || 'N/A'}</TableCell>
                        <TableCell>{(employee as any).shift?.name || 'N/A'}</TableCell>
                        <TableCell>{(employee as any).attendance_rule?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {employee.isAssigned ? (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm">Assigned</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400">
                              <Circle className="h-4 w-4" />
                              <span className="text-sm">Not Assigned</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {selectedEmployeeIds.length > 0 ? (
            <span>
              <strong>{selectedEmployeeIds.length}</strong> employee(s) selected
            </span>
          ) : (
            <span>No employees selected</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(getBackPath())}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedEmployeeIds.length === 0 || bulkUpdateMutation.isPending}
          >
            {bulkUpdateMutation.isPending ? 'Assigning...' : 'Assign Selected'}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to assign <strong>{selectedEmployeeIds.length}</strong> employee(s) to{' '}
              <strong>{itemDetails.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAssign} disabled={bulkUpdateMutation.isPending}>
              {bulkUpdateMutation.isPending ? 'Assigning...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


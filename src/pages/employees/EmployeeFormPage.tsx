import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDepartments } from '@/hooks/useDepartments';
import { useAuth } from '@/contexts/AuthContext';
import { designationService } from '@/services/designationService';
import { ShiftService } from '@/services/shiftService';
import { httpClient } from '@/services/httpClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { getCurrentOrganizationId } from '@/lib/organization-utils';
import { formatDateForInput, convertDateStringToDate } from '@/lib/date-utils';
import { format } from 'date-fns';
import { employeeService } from '@/services/employeeService';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { employeeFormSchema, EmployeeFormData } from '../../types/forms';

// Extended schema that includes the code field and handles date objects for form validation
const extendedEmployeeSchema = employeeFormSchema.extend({
  code: z.string().min(1, "Employee code is required").regex(/^[A-Z0-9]+$/, "Employee code must contain only uppercase letters and numbers"),
  date_of_birth: z.date().optional().or(z.string().optional()),
  joining_date: z.date().optional().or(z.string().optional()),
});

// Extended type that includes the code field and handles date objects
type ExtendedInsertEmployee = Omit<EmployeeFormData, 'date_of_birth' | 'joining_date'> & { 
  code: string;
  date_of_birth?: Date | string;
  joining_date?: Date | string;
};

export default function EmployeeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // Fetch employee data for editing
  const { 
    data: employeeResponse, 
    isLoading: isLoadingEmployee,
    error: employeeError 
  } = useQuery({
    queryKey: ['employee', 'detail', id],
    queryFn: () => employeeService.getEmployee(id!, ['department', 'designation', 'shift']),
    enabled: isEditMode && !!id,
  });

  const employee = employeeResponse?.data;

  // Hook to fetch departments data
  const { departments, isLoading: departmentsLoading } = useDepartments(true);
  
  // State for designations
  const [designations, setDesignations] = useState<any[]>([]);
  const [designationsLoading, setDesignationsLoading] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>();
  
  // State for shifts
  const [shifts, setShifts] = useState<any[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  
  // State for attendance rules
  const [attendanceRules, setAttendanceRules] = useState<any[]>([]);
  const [attendanceRulesLoading, setAttendanceRulesLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<ExtendedInsertEmployee>({
    resolver: zodResolver(extendedEmployeeSchema),
  });

  // Watch the department_id field to trigger designation fetch
  const watchedDepartmentId = watch('department_id');

  // Set initial data when in edit mode
  useEffect(() => {
    if (isEditMode && employee) {
      const formData = {
        name: employee.name,
        mobile: employee.mobile,
        email: employee.email,
        password: employee.password,
        included_in_payroll: employee.included_in_payroll,
        date_of_birth: employee.date_of_birth,
        address: employee.address,
        pan_number: employee.pan_number,
        status: employee.status,
        joining_date: employee.joining_date,
        organisation_id: employee.organisation_id,
        department_id: employee.department_id,
        designation_id: employee.designation_id,
        shift_id: employee.shift_id,
        bank_details: employee.bank_details,
        role_id: employee.role_id,
        code: employee.id?.slice(0, 8).toUpperCase() || 'EMP001'
      };
      
      reset(formData);
      
      // Trigger designation fetch if department is set
      if (employee.department_id) {
        setSelectedDepartmentId(employee.department_id);
        fetchDesignations(employee.department_id);
      }
    }
  }, [isEditMode, employee, reset]);

  // Fetch shifts and attendance rules when component mounts
  useEffect(() => {
    fetchShifts();
    fetchAttendanceRules();
  }, []);

  // Fetch designations when department changes
  useEffect(() => {
    if (watchedDepartmentId && watchedDepartmentId !== selectedDepartmentId) {
      setSelectedDepartmentId(watchedDepartmentId);
      fetchDesignations(watchedDepartmentId);
      // Clear designation selection when department changes
      setValue('designation_id', undefined);
    } else if (!watchedDepartmentId) {
      // Clear designations when no department is selected
      setDesignations([]);
      setSelectedDepartmentId(undefined);
    }
  }, [watchedDepartmentId, selectedDepartmentId, setValue]);

  const fetchShifts = async () => {
    try {
      setShiftsLoading(true);
      
      const organisationId = getCurrentOrganizationId();
      
      const response = await ShiftService.getShifts(organisationId);

      if (response.status && response.data) {
        setShifts(response.data);
      } else {
        console.error('Failed to fetch shifts:', response.message);
        setShifts([]);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
      setShifts([]);
    } finally {
      setShiftsLoading(false);
    }
  };

  const fetchAttendanceRules = async () => {
    try {
      setAttendanceRulesLoading(true);
      
      const organisationId = getCurrentOrganizationId();
      
      console.log('Fetching attendance rules for organisation:', organisationId);
      
      try {
        const response = await httpClient.post(API_ENDPOINTS.ATTENDANCE_POLICIES_LIST, {
          organisation_id: organisationId,
          page: 1,
          page_size: 100
        });

        console.log('Attendance rules API response (httpClient):', response.data);

        if (response.data.status && response.data.data) {
          console.log('Successfully fetched attendance rules:', response.data.data);
          setAttendanceRules(response.data.data);
          return;
        } else {
          console.error('Failed to fetch attendance rules (httpClient):', response.data.message || 'Unknown error');
        }
      } catch (httpClientError) {
        console.log('httpClient failed, trying direct fetch:', httpClientError);
        
        // Fallback to direct fetch
        const response = await fetch(`${process.env.VITE_API_BASE_URL || 'https://hrms-backend-omega.vercel.app/api/v1'}/attendance_rules/list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('hrms_auth_token')}`
          },
          body: JSON.stringify({
            organisation_id: organisationId,
            page: 1,
            page_size: 100
          })
        });

        const data = await response.json();

        if (data.status && data.data) {
          console.log('Successfully fetched attendance rules (fetch):', data.data);
          setAttendanceRules(data.data);
        } else {
          console.error('Failed to fetch attendance rules (fetch):', data.message || 'Unknown error');
          setAttendanceRules([]);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance rules:', error);
      setAttendanceRules([]);
    } finally {
      setAttendanceRulesLoading(false);
    }
  };

  const fetchDesignations = async (departmentId: string) => {
    if (!departmentId) return;
    
    try {
      setDesignationsLoading(true);
      setDesignations([]);
      
      const organisationId = getCurrentOrganizationId();
      
      const response = await designationService.getDesignations({
        department_id: departmentId
      });

      if (response.status && response.data) {
        setDesignations(response.data);
      } else {
        console.error('Failed to fetch designations:', response.message);
        setDesignations([]);
      }
    } catch (error) {
      console.error('Error fetching designations:', error);
      setDesignations([]);
    } finally {
      setDesignationsLoading(false);
    }
  };

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: (data: Partial<ExtendedInsertEmployee>) => employeeService.createEmployee(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Employee created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['employees', 'list'] });
      navigate('/admin/employees');
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
    mutationFn: (data: Partial<ExtendedInsertEmployee> & { id: string }) => {
      return employeeService.updateEmployee(data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Employee updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['employees', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['employee', 'detail', id] });
      navigate('/admin/employees');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update employee',
        variant: 'destructive',
      });
    },
  });

  const handleFormSubmit = (data: ExtendedInsertEmployee) => {
    console.log('Form submitted with data:', data);
    console.log('Is edit mode:', isEditMode);
    
    // Convert Date objects to ISO-8601 DateTime format before submitting
    const processedData = {
      ...data,
      date_of_birth: data.date_of_birth ? 
        (data.date_of_birth instanceof Date ? data.date_of_birth.toISOString() : data.date_of_birth) 
        : undefined,
      joining_date: data.joining_date ? 
        (data.joining_date instanceof Date ? data.joining_date.toISOString() : data.joining_date) 
        : undefined,
    };
    
    console.log('Processed data:', processedData);
    
    if (isEditMode && id) {
      updateEmployeeMutation.mutate({ ...processedData, id });
    } else {
      createEmployeeMutation.mutate(processedData);
    }
  };


  if (isEditMode && isLoadingEmployee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isEditMode && (employeeError || !employee)) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">
          Error loading employee: {employeeError instanceof Error ? employeeError.message : 'Employee not found'}
        </p>
        <Button onClick={() => navigate('/admin/employees')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center justify-end">
        <Button 
          onClick={handleSubmit(handleFormSubmit)}
          disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {createEmployeeMutation.isPending || updateEmployeeMutation.isPending 
            ? 'Saving...' 
            : (isEditMode ? 'Update Employee' : 'Save Employee')
          }
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  {...register('name')}
                  error={errors.name?.message}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number <span className="text-red-500">*</span></Label>
                <Input
                  id="mobile"
                  {...register('mobile')}
                  error={errors.mobile?.message}
                  placeholder="Enter mobile number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Controller
                  name="date_of_birth"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formatDateForInput(field.value)}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        field.onChange(date);
                      }}
                      error={errors.date_of_birth?.message}
                    />
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register('address')}
                error={errors.address?.message}
                placeholder="Enter address"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader>
            <CardTitle>Work Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Employee Code <span className="text-red-500">*</span></Label>
                <Input
                  id="code"
                  {...register('code')}
                  error={errors.code?.message}
                  placeholder="e.g., EMP001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department_id">Department <span className="text-red-500">*</span></Label>
                <Controller
                  name="department_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <SelectTrigger disabled={departmentsLoading}>
                        <SelectValue placeholder={departmentsLoading ? "Loading..." : "Select Department"} />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation_id">Designation <span className="text-red-500">*</span></Label>
                <Controller
                  name="designation_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <SelectTrigger disabled={designationsLoading || !selectedDepartmentId}>
                        <SelectValue placeholder={
                          !selectedDepartmentId 
                            ? "Select Department First" 
                            : designationsLoading 
                              ? "Loading designations..." 
                              : "Select Designation"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {designationsLoading ? (
                          <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                            Loading designations...
                          </div>
                        ) : designations.length > 0 ? (
                          designations.map((designation) => (
                            <SelectItem key={designation.id} value={designation.id}>
                              {designation.name}
                            </SelectItem>
                          ))
                        ) : selectedDepartmentId && !designationsLoading ? (
                          <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                            No designations found for this department
                          </div>
                        ) : null}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift_id">Shift</Label>
                <Controller
                  name="shift_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <SelectTrigger disabled={shiftsLoading}>
                        <SelectValue placeholder={shiftsLoading ? "Loading shifts..." : "Select Shift"} />
                      </SelectTrigger>
                      <SelectContent>
                        {shiftsLoading ? (
                          <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                            Loading shifts...
                          </div>
                        ) : shifts.length > 0 ? (
                          shifts.map((shift) => (
                            <SelectItem key={shift.id} value={shift.id}>
                              {shift.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                            No shifts found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance_rule_id">Attendance Rule</Label>
                <Controller
                  name="attendance_rule_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <SelectTrigger disabled={attendanceRulesLoading}>
                        <SelectValue placeholder={attendanceRulesLoading ? "Loading rules..." : "Select Attendance Rule"} />
                      </SelectTrigger>
                      <SelectContent>
                        {attendanceRulesLoading ? (
                          <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                            Loading attendance rules...
                          </div>
                        ) : attendanceRules.length > 0 ? (
                          attendanceRules.map((rule) => (
                            <SelectItem key={rule.id} value={rule.id}>
                              {rule.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                            No attendance rules found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joining_date">Joining Date</Label>
                <Controller
                  name="joining_date"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="joining_date"
                      type="date"
                      value={formatDateForInput(field.value)}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        field.onChange(date);
                      }}
                      error={errors.joining_date?.message}
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pan_number">PAN Number</Label>
                <Input
                  id="pan_number"
                  {...register('pan_number')}
                  error={errors.pan_number?.message}
                  placeholder="PAN number"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

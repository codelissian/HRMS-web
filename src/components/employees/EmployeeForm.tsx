import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeFormSchema, EmployeeFormData } from '../../types/forms';
import { z } from 'zod';

// Extended schema that includes the code field and handles date strings from API
const extendedEmployeeSchema = employeeFormSchema.extend({
  code: z.string().min(1, "Employee code is required").regex(/^[A-Z0-9]+$/, "Employee code must contain only uppercase letters and numbers"),
});

// Extended type that includes the code field
type ExtendedInsertEmployee = EmployeeFormData & { code: string };
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useDepartments } from '@/hooks/useDepartments';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { designationService } from '@/services/designationService';
import { ShiftService } from '@/services/shiftService';
import { httpClient } from '@/services/httpClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { getCurrentOrganizationId } from '@/lib/organization-utils';
import { formatDateForInput, convertDateStringToDate } from '@/lib/date-utils';

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ExtendedInsertEmployee) => void;
  loading?: boolean;
  initialData?: Partial<ExtendedInsertEmployee>;
  title?: string;
  description?: string;
  isEditMode?: boolean;
  isFetchingData?: boolean;
}

export function EmployeeForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  loading = false,
  initialData,
  title = 'Add New Employee',
  description = 'Fill in the employee details below.',
  isEditMode = false,
  isFetchingData = false
}: EmployeeFormProps) {
  console.log('EmployeeForm rendered with props:', { 
    open, 
    isEditMode, 
    initialData, 
    loading, 
    isFetchingData 
  });
  
  // ✅ Hook to fetch departments data - only when form is open
  const { departments, isLoading: departmentsLoading } = useDepartments(open);
  
  // New state for designations
  const [designations, setDesignations] = useState<any[]>([]);
  const [designationsLoading, setDesignationsLoading] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>();
  
  // New state for shifts
  const [shifts, setShifts] = useState<any[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  
  // New state for attendance rules
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
    defaultValues: initialData,
  });

  // Watch the department_id field to trigger designation fetch
  const watchedDepartmentId = watch('department_id');
  
  // Check form validity (moved after useForm initialization)
  const formValues = watch();
  const isFormValid = Object.keys(errors).length === 0;
  console.log('Form validity check:', { 
    formValues, 
    errors, 
    isFormValid,
    hasRequiredFields: !!(formValues.name && formValues.mobile && formValues.code),
    isFetchingData,
    formDisabled: isFetchingData,
    formReady: !!formValues
  });

  // Set initial data when form opens in edit mode
  useEffect(() => {
    console.log('Form useEffect triggered:', { open, initialData, isEditMode });
    if (open && initialData && isEditMode) {
      console.log('Resetting form with initial data:', initialData);
      reset(initialData);
      // Trigger designation fetch if department is set
      if (initialData.department_id) {
        setSelectedDepartmentId(initialData.department_id);
        fetchDesignations(initialData.department_id);
      }
      // Always fetch shifts and attendance rules for edit mode
      fetchShifts();
      fetchAttendanceRules();
    }
  }, [open, initialData, isEditMode, reset]);

  // Fetch shifts and attendance rules when form opens
  useEffect(() => {
    if (open) {
      fetchShifts();
      fetchAttendanceRules();
    }
  }, [open]);

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
        // Retry once after a short delay
        setTimeout(() => {
          fetchShifts();
        }, 1000);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
      setShifts([]);
      // Retry once after a short delay
      setTimeout(() => {
        fetchShifts();
      }, 1000);
    } finally {
      setShiftsLoading(false);
    }
  };

  const fetchAttendanceRules = async () => {
    try {
      setAttendanceRulesLoading(true);
      
      const organisationId = getCurrentOrganizationId();
      
      console.log('Fetching attendance rules for organisation:', organisationId);
      
      // Try using httpClient first
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
        const response = await fetch(`${process.env.VITE_API_BASE_URL || 'http://35.224.247.153:9000/api/v1'}/attendance_rules/list`, {
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

        console.log('Attendance rules API response status (fetch):', response.status);
        
        const data = await response.json();
        console.log('Attendance rules API response data (fetch):', data);

        if (data.status && data.data) {
          console.log('Successfully fetched attendance rules (fetch):', data.data);
          setAttendanceRules(data.data);
        } else {
          console.error('Failed to fetch attendance rules (fetch):', data.message || 'Unknown error');
          console.error('Full response:', data);
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
        // Retry once after a short delay
        setTimeout(() => {
          if (departmentId === selectedDepartmentId) {
            fetchDesignations(departmentId);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error fetching designations:', error);
      setDesignations([]);
      // Retry once after a short delay
      setTimeout(() => {
        if (departmentId === selectedDepartmentId) {
          fetchDesignations(departmentId);
        }
      }, 1000);
    } finally {
      setDesignationsLoading(false);
    }
  };


  

  const handleFormSubmit = (data: ExtendedInsertEmployee) => {
    console.log('Form submitted with data:', data);
    console.log('Is edit mode:', isEditMode);
    
    // Convert date strings to Date objects before submitting
    const processedData = {
      ...data,
      date_of_birth: convertDateStringToDate(data.date_of_birth),
      joining_date: convertDateStringToDate(data.joining_date),
    };
    
    console.log('Processed data:', processedData);
    onSubmit(processedData);
    reset();
    setDesignations([]);
    setSelectedDepartmentId(undefined);
    setShifts([]);
    setAttendanceRules([]);
  };

  const handleClose = () => {
    reset();
    setDesignations([]);
    setSelectedDepartmentId(undefined);
    setShifts([]);
    setAttendanceRules([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Employee' : title}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the employee details below.' : description}
          </DialogDescription>
        </DialogHeader>

        {isFetchingData && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-600">Loading employee data...</span>
          </div>
        )}

        <form onSubmit={(e) => {
          e.preventDefault();
          console.log('Form submit event triggered');
          console.log('Current form values:', watch());
          console.log('Form errors:', errors);
          console.log('Is edit mode:', isEditMode);
          console.log('Loading state:', loading);
          
          const submitHandler = handleSubmit(handleFormSubmit, (errors) => {
            console.log('Form validation errors:', errors);
            console.log('Validation failed - form not submitted');
          });
          
          console.log('About to call submit handler');
          submitHandler();
          
          // Also try direct submission for testing
          console.log('Trying direct submission for testing...');
          setTimeout(() => {
            console.log('Direct submission attempt');
            handleFormSubmit(formValues as ExtendedInsertEmployee);
          }, 100);
        }} className={`space-y-6 ${isFetchingData ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Personal Information
            </h4>
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
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Work Information
            </h4>
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
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Additional Information
            </h4>
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              onClick={(e) => {
                console.log('Button clicked!', e);
                console.log('Button type:', e.currentTarget.type);
                console.log('Form disabled:', loading);
              }}
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update Employee' : 'Save Employee')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

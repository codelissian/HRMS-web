import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertEmployeeSchema, InsertEmployee } from '../../../shared/schema';
import { z } from 'zod';

// Extended schema that includes the code field and handles date strings from API
const extendedEmployeeSchema = insertEmployeeSchema.extend({
  code: z.string().min(1, "Employee code is required").regex(/^[A-Z0-9]+$/, "Employee code must contain only uppercase letters and numbers"),
  date_of_birth: z.union([z.date(), z.string(), z.null(), z.undefined()]).optional(),
  joining_date: z.union([z.date(), z.string(), z.null(), z.undefined()]).optional(),
});

// Extended type that includes the code field
type ExtendedInsertEmployee = InsertEmployee & { code: string };
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
  
  // ✅ Hook to fetch departments data - only when form is open
  const { departments, isLoading: departmentsLoading } = useDepartments(open);
  
  // New state for designations
  const [designations, setDesignations] = useState<any[]>([]);
  const [designationsLoading, setDesignationsLoading] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>();
  
  // New state for shifts
  const [shifts, setShifts] = useState<any[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  
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

  // Set initial data when form opens in edit mode
  useEffect(() => {
    if (open && initialData && isEditMode) {
      reset(initialData);
      // Trigger designation fetch if department is set
      if (initialData.department_id) {
        setSelectedDepartmentId(initialData.department_id);
        fetchDesignations(initialData.department_id);
      }
      // Always fetch shifts for edit mode
      fetchShifts();
    }
  }, [open, initialData, isEditMode, reset]);

  // Fetch shifts when form opens
  useEffect(() => {
    if (open) {
      fetchShifts();
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
    // Convert date strings to Date objects before submitting
    const processedData = {
      ...data,
      date_of_birth: convertDateStringToDate(data.date_of_birth),
      joining_date: convertDateStringToDate(data.joining_date),
    };
    
    onSubmit(processedData);
    reset();
    setDesignations([]);
    setSelectedDepartmentId(undefined);
    setShifts([]);
  };

  const handleClose = () => {
    reset();
    setDesignations([]);
    setSelectedDepartmentId(undefined);
    setShifts([]);
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

        <form onSubmit={handleSubmit(handleFormSubmit)} className={`space-y-6 ${isFetchingData ? 'opacity-50 pointer-events-none' : ''}`}>
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
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  {...register('emergency_contact')}
                  error={errors.emergency_contact?.message}
                  placeholder="Emergency contact number"
                />
              </div>
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditMode ? 'Update Employee' : 'Save Employee')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDepartments } from '@/hooks/useDepartments';
import { useEmployeeForm } from '@/hooks/useEmployeeForm';
import { useFormData } from '@/hooks/useFormData';
import { useEmployeeMutations } from '@/hooks/useEmployeeMutations';
import { FormInitializationService } from '@/services/formInitializationService';
import { PersonalInfoSection } from '@/components/employees/form/PersonalInfoSection';
import { WorkInfoSection } from '@/components/employees/form/WorkInfoSection';
import { AdditionalInfoSection } from '@/components/employees/form/AdditionalInfoSection';
import { FormActions } from '@/components/employees/form/FormActions';
import { LoadingSpinner, ErrorState } from '@/components/employees/form/LoadingStates';
import { ExtendedInsertEmployee } from '@/hooks/useEmployeeForm';


export default function EmployeeFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  // Custom hooks
  const { 
    form, 
    employee, 
    isLoading, 
    error, 
    isInitialSetup, 
    setIsInitialSetup, 
    selectedDepartmentId, 
    setSelectedDepartmentId 
  } = useEmployeeForm(id);
  
  const { 
    designations, 
    shifts, 
    attendanceRules, 
    designationsLoading, 
    shiftsLoading, 
    attendanceRulesLoading, 
    fetchDesignations, 
    fetchShifts, 
    fetchAttendanceRules 
  } = useFormData();
  
  const { departments, isLoading: departmentsLoading } = useDepartments(true);
  const { createMutation, updateMutation } = useEmployeeMutations(id);
  
  const { register, handleSubmit, formState: { errors }, reset, control, watch, setValue } = form;
  
  // Debug form state
  console.log('🔍 Form errors:', errors);
  console.log('🔍 Form is valid:', Object.keys(errors).length === 0);

  // Form initialization effect
  useEffect(() => {
    if (isEditMode && employee) {
      const formData = FormInitializationService.prepareFormData(employee);
      setIsInitialSetup(true);
      
      FormInitializationService.initializeEmployeeForm(employee, formData, {
        fetchShifts,
        fetchAttendanceRules,
        fetchDesignations,
        reset,
        setValue,
        watch,
      }).finally(() => {
        setTimeout(() => setIsInitialSetup(false), 300);
      });
    }
  }, [isEditMode, employee, fetchShifts, fetchAttendanceRules, fetchDesignations, reset, setValue, watch, setIsInitialSetup]);

  // Initial data fetch effect
  useEffect(() => {
    fetchShifts();
    fetchAttendanceRules();
  }, [fetchShifts, fetchAttendanceRules]);

  // Department change effect
  useEffect(() => {
    const watchedDepartmentId = watch('department_id');
    console.log('🔄 Department change useEffect triggered:', {
      watchedDepartmentId,
      selectedDepartmentId,
      isInitialSetup
    });
    
    if (watchedDepartmentId && watchedDepartmentId !== selectedDepartmentId) {
      console.log('🏢 Department changed, fetching designations');
      setSelectedDepartmentId(watchedDepartmentId);
      fetchDesignations(watchedDepartmentId);
      
      // Only clear designation selection when department changes (not during initial setup)
      if (!isInitialSetup) {
        console.log('🗑️ Clearing designation (user changed department)');
      setValue('designation_id', undefined);
      } else {
        console.log('🚫 Skipping designation clear (initial setup)');
      }
    } else if (!watchedDepartmentId) {
      console.log('🚫 No department selected, clearing designations');
      // Clear designations when no department is selected
      setSelectedDepartmentId(undefined);
    }
  }, [watch('department_id'), selectedDepartmentId, isInitialSetup, setValue, fetchDesignations, setSelectedDepartmentId]);

  const handleFormSubmit = (data: ExtendedInsertEmployee) => {
    console.log('🚀 Form submitted with data:', data);
    console.log('📝 Is edit mode:', isEditMode);
    console.log('🆔 Employee ID:', id);
    console.log('🔍 Form errors:', errors);
    
    if (isEditMode && id) {
      console.log('✅ Calling update mutation');
      updateMutation.mutate({ ...data, id });
    } else {
      console.log('✅ Calling create mutation');
      createMutation.mutate(data);
    }
  };

  const handleFormError = (errors: any) => {
    console.error('❌ Form validation errors:', errors);
    console.error('❌ Form failed validation, preventing submission');
    console.error('❌ Detailed validation errors:', JSON.stringify(errors, null, 2));
  };

  
  // Loading and error states
  if (isEditMode && isLoading) return <LoadingSpinner />;
  if (isEditMode && (error || !employee)) return <ErrorState error={error} />;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)} className="space-y-6">
        <FormActions 
          onSubmit={handleSubmit(handleFormSubmit)}
          isLoading={createMutation.isPending || updateMutation.isPending}
          isEditMode={isEditMode}
                />
        <PersonalInfoSection 
          register={register}
                  control={control}
          errors={errors}
                    />
        
        <WorkInfoSection
          register={register}
                  control={control}
          errors={errors}
          departments={departments}
          designations={designations}
          shifts={shifts}
          attendanceRules={attendanceRules}
          departmentsLoading={departmentsLoading}
          designationsLoading={designationsLoading}
          shiftsLoading={shiftsLoading}
          attendanceRulesLoading={attendanceRulesLoading}
          selectedDepartmentId={selectedDepartmentId}
        />
        
        <AdditionalInfoSection
          register={register}
                  control={control}
          errors={errors}
        />
      </form>
    </div>
  );
}

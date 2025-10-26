import { ExtendedInsertEmployee } from '@/hooks/useEmployeeForm';

interface FormDependencies {
  fetchShifts: () => Promise<void>;
  fetchAttendanceRules: () => Promise<void>;
  fetchDesignations: (departmentId: string) => Promise<void>;
  reset: (data: any) => void;
  setValue: (name: string, value: any) => void;
  watch: (name: string) => any;
}

export class FormInitializationService {
  static async initializeEmployeeForm(
    employee: any,
    formData: ExtendedInsertEmployee,
    dependencies: FormDependencies
  ) {
    try {
      console.log('🔄 Setting up edit form for employee:', {
        id: employee.id,
        name: employee.name,
        department_id: employee.department_id,
        designation_id: employee.designation_id,
        shift_id: employee.shift_id,
        attendance_rule_id: employee.attendance_rule_id
      });
      
      console.log('📝 Form data prepared:', formData);
      
      // Fetch all required data FIRST
      await Promise.all([
        dependencies.fetchShifts(),
        dependencies.fetchAttendanceRules()
      ]);
      
      // Fetch designations if department is set
      if (employee.department_id) {
        await dependencies.fetchDesignations(employee.department_id);
        
        // Wait a bit more to ensure designations are fully loaded
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Now reset form with all data loaded
      console.log('✅ All data loaded, resetting form');
      dependencies.reset(formData);
      
      // Explicitly set designation after form reset
      if (employee.designation_id) {
        console.log('🔧 Explicitly setting designation after form reset:', employee.designation_id);
        dependencies.setValue('designation_id', employee.designation_id);
      }
      
      // Verify designation value after reset
      setTimeout(() => {
        const currentDesignationValue = dependencies.watch('designation_id');
        console.log('🔍 Designation value after form reset:', currentDesignationValue);
        
        // If designation is still not set, try again
        if (employee.designation_id && !currentDesignationValue) {
          console.log('🔧 Designation still not set, trying again:', employee.designation_id);
          dependencies.setValue('designation_id', employee.designation_id);
          
          // Verify it was set
          setTimeout(() => {
            const verifyValue = dependencies.watch('designation_id');
            console.log('✅ Final verification - designation value:', verifyValue);
          }, 100);
        }
      }, 200);
      
    } catch (error) {
      console.error('❌ Error during form initialization:', error);
      // Still reset form even if some data fails to load
      dependencies.reset(formData);
    }
  }
  
  static prepareFormData(employee: any): ExtendedInsertEmployee {
    return {
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
      attendance_rule_id: employee.attendance_rule_id,
      bank_details: employee.bank_details,
      code: employee.id?.slice(0, 8).toUpperCase() || 'EMP001'
    };
  }
}

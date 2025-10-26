import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '@/services/employeeService';
import { useToast } from '@/hooks/use-toast';
import { ExtendedInsertEmployee } from './useEmployeeForm';

interface UseEmployeeMutationsReturn {
  createMutation: any;
  updateMutation: any;
}

// Helper function to process form data
const processFormData = (data: Partial<ExtendedInsertEmployee>) => {
  return {
    ...data,
    date_of_birth: data.date_of_birth ? 
      (data.date_of_birth instanceof Date ? data.date_of_birth.toISOString() : data.date_of_birth) 
      : undefined,
    joining_date: data.joining_date ? 
      (data.joining_date instanceof Date ? data.joining_date.toISOString() : data.joining_date) 
      : undefined,
  };
};

export const useEmployeeMutations = (employeeId?: string): UseEmployeeMutationsReturn => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const createMutation = useMutation({
    mutationFn: (data: Partial<ExtendedInsertEmployee>) => {
      const processedData = processFormData(data);
      return employeeService.createEmployee(processedData);
    },
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
  
  const updateMutation = useMutation({
    mutationFn: (data: Partial<ExtendedInsertEmployee> & { id: string }) => {
      console.log('🔄 Update mutation called with:', data);
      const processedData = processFormData(data);
      console.log('📝 Processed data for update:', processedData);
      return employeeService.updateEmployee(processedData as any);
    },
    onSuccess: (result) => {
      console.log('✅ Update mutation successful:', result);
      toast({
        title: 'Success',
        description: 'Employee updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['employees', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['employee', 'detail', employeeId] });
      navigate('/admin/employees');
    },
    onError: (error) => {
      console.error('❌ Update mutation failed:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update employee',
        variant: 'destructive',
      });
    },
  });
  
  return { createMutation, updateMutation };
};

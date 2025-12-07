import { useState } from 'react';
import { useForm, Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import { employeeFormSchema } from '@/types/forms';
import { z } from 'zod';

// Extended schema that includes the code field and handles date objects for form validation
const extendedEmployeeSchema = employeeFormSchema.extend({
  code: z.string().min(1, "Employee code is required"),
  date_of_birth: z.date().optional().or(z.string().optional()),
  joining_date: z.date().optional().or(z.string().optional()),
});

// Extended type that includes the code field and handles date objects
export type ExtendedInsertEmployee = Omit<any, 'date_of_birth' | 'joining_date'> & { 
  code: string;
  date_of_birth?: Date | string;
  joining_date?: Date | string;
};

interface UseEmployeeFormReturn {
  form: {
    register: UseFormRegister<ExtendedInsertEmployee>;
    handleSubmit: any;
    formState: { errors: FieldErrors<ExtendedInsertEmployee> };
    reset: (data: any) => void;
    control: Control<ExtendedInsertEmployee>;
    watch: (name: string) => any;
    setValue: (name: string, value: any) => void;
  };
  employee: any;
  isLoading: boolean;
  error: any;
  isInitialSetup: boolean;
  setIsInitialSetup: (value: boolean) => void;
  selectedDepartmentId: string | undefined;
  setSelectedDepartmentId: (value: string | undefined) => void;
}

export const useEmployeeForm = (employeeId?: string): UseEmployeeFormReturn => {
  const [isInitialSetup, setIsInitialSetup] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>();
  
  // Form setup
  const form = useForm<ExtendedInsertEmployee>({
    resolver: zodResolver(extendedEmployeeSchema),
  });
  
  // Employee data fetching
  const { 
    data: employeeResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['employee', 'detail', employeeId],
    queryFn: () => employeeService.getEmployee(employeeId!, ['department', 'designation', 'shift']),
    enabled: !!employeeId,
  });
  
  const employee = employeeResponse?.data;
  
  return {
    form,
    employee,
    isLoading,
    error,
    isInitialSetup,
    setIsInitialSetup,
    selectedDepartmentId,
    setSelectedDepartmentId,
  };
};

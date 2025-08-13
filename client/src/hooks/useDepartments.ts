import { useQuery } from '@tanstack/react-query';
import { departmentService } from '@/services/departmentService';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export function useDepartments(enabled: boolean = true) {
  const { user } = useAuth();
  const organisationId = user?.organisation_id;

  const { data: departmentsResponse, isLoading, error } = useQuery({
    queryKey: ['departments', organisationId],
    queryFn: async () => {
      const filters = organisationId ? {
        organisation_id: organisationId,
        page: 1,
        page_size: 100
      } : {
        page: 1,
        page_size: 100
      };
      
      const result = await departmentService.getDepartments(filters);
      return result;
    },
    enabled: enabled,
  });

  // Extract organisation_id from departments response if user doesn't have it
  useEffect(() => {
    if (departmentsResponse?.data && departmentsResponse.data.length > 0 && !organisationId) {
      const firstDept = departmentsResponse.data[0];
      if (firstDept.organisation_id) {
        // Update the user data with the extracted organisation_id
        const updatedUser = {
          ...user!,
          organisation_id: firstDept.organisation_id
        };
        
        // Update localStorage
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        
        // Force a page reload to update the auth context
        window.location.reload();
      }
    }
  }, [departmentsResponse, organisationId, user]);

  return {
    departments: departmentsResponse?.data || [],
    isLoading,
    error,
  };
} 
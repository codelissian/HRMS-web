import { httpClient } from '@/services/httpClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { Department } from '@shared/schema';
import { FilterRequest, ApiResponse } from '@/types/api';

class DepartmentService {
  async getDepartments(filters: FilterRequest): Promise<ApiResponse<Department[]>> {
    const response = await httpClient.post<ApiResponse<Department[]>>(
      API_ENDPOINTS.DEPARTMENTS_LIST, 
      filters
    );
    return response.data;
  }
}

export const departmentService = new DepartmentService(); 
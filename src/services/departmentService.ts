import { httpClient } from '@/lib/httpClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { Department } from '../types/database';
import { FilterRequest, ApiResponse } from '@/types/api';

interface CreateDepartmentRequest {
  name: string;
  description?: string;
}

class DepartmentService {
  async getDepartments(filters: FilterRequest): Promise<ApiResponse<Department[]>> {
    const response = await httpClient.post<ApiResponse<Department[]>>(
      API_ENDPOINTS.DEPARTMENTS_LIST, 
      filters
    );
    return response.data;
  }

  async createDepartment(data: CreateDepartmentRequest): Promise<ApiResponse<Department>> {
    const response = await httpClient.post<ApiResponse<Department>>(
      API_ENDPOINTS.DEPARTMENTS_CREATE,
      data
    );
    return response.data;
  }

  async deleteDepartment(id: string): Promise<ApiResponse<any>> {
    const response = await httpClient.patch<ApiResponse<any>>(
      API_ENDPOINTS.DEPARTMENTS_DELETE,
      { id }
    );
    return response.data;
  }

  async updateDepartment(data: { id: string; name: string; description?: string }): Promise<ApiResponse<Department>> {
    const response = await httpClient.put<ApiResponse<Department>>(
      API_ENDPOINTS.DEPARTMENTS_UPDATE,
      data
    );
    return response.data;
  }
}

export const departmentService = new DepartmentService(); 
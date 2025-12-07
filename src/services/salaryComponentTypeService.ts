import { httpClient } from '@/lib/httpClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { ApiResponse, FilterRequest } from '@/types/api';

export interface SalaryComponentType {
  id: string;
  name: string;
  type: string;
  organisation_id: string;
  sequence: number;
  active_flag: boolean;
  delete_flag: boolean;
  created_at: string;
  modified_at: string;
  created_by?: string | null;
  modified_by?: string | null;
}

export interface CreateSalaryComponentTypeRequest {
  name: string;
  type: string;
  organisation_id: string;
  sequence: number;
}

export interface UpdateSalaryComponentTypeRequest extends CreateSalaryComponentTypeRequest {
  id: string;
}

export class SalaryComponentTypeService {
  /**
   * Get all salary component types with filters
   */
  async getSalaryComponentTypes(filters: FilterRequest): Promise<ApiResponse<SalaryComponentType[]>> {
    const response = await httpClient.post<ApiResponse<SalaryComponentType[]>>(API_ENDPOINTS.SALARY_COMPONENT_TYPES_LIST, filters);
    return response.data;
  }

  /**
   * Create a new salary component type
   */
  async createSalaryComponentType(data: CreateSalaryComponentTypeRequest): Promise<ApiResponse<SalaryComponentType>> {
    const response = await httpClient.post<ApiResponse<SalaryComponentType>>(API_ENDPOINTS.SALARY_COMPONENT_TYPES_CREATE, data);
    return response.data;
  }

  /**
   * Update a salary component type
   */
  async updateSalaryComponentType(data: UpdateSalaryComponentTypeRequest): Promise<ApiResponse<SalaryComponentType>> {
    const response = await httpClient.post<ApiResponse<SalaryComponentType>>(API_ENDPOINTS.SALARY_COMPONENT_TYPES_UPDATE, data);
    return response.data;
  }

  /**
   * Get a single salary component type
   */
  async getSalaryComponentType(id: string): Promise<ApiResponse<SalaryComponentType>> {
    const response = await httpClient.post<ApiResponse<SalaryComponentType>>(API_ENDPOINTS.SALARY_COMPONENT_TYPES_ONE, { id });
    return response.data;
  }

  /**
   * Delete a salary component type
   */
  async deleteSalaryComponentType(id: string): Promise<ApiResponse<void>> {
    const response = await httpClient.patch<ApiResponse<void>>(API_ENDPOINTS.SALARY_COMPONENT_TYPES_DELETE, { id });
    return response.data;
  }
}

export const salaryComponentTypeService = new SalaryComponentTypeService();
import { httpClient } from '@/lib/httpClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { ApiResponse, FilterRequest } from '@/types/api';

export interface SalaryComponent {
  id: string;
  employee_id: string;
  organisation_id: string;
  salary_component_type_id: string;
  calculation: 'FIXED' | 'PERCENTAGE';
  value: number;
  formula?: string | null;
  active_flag: boolean;
  delete_flag: boolean;
  created_at: string;
  modified_at: string;
  created_by?: string | null;
  modified_by?: string | null;
  salary_component_type?: {
    id: string;
    name: string;
    type: string;
    organisation_id: string;
    sequence: number;
    active_flag: boolean;
    delete_flag: boolean;
    modified_at: string;
    created_at: string;
    created_by?: string | null;
    modified_by?: string | null;
  };
}

export interface CreateSalaryComponentRequest {
  employee_id: string;
  organisation_id: string;
  salary_component_type_id: string;
  calculation: 'FIXED' | 'PERCENTAGE';
  value: number;
  sequence?: number;
  is_taxable?: boolean;
}

export interface UpdateSalaryComponentRequest extends CreateSalaryComponentRequest {
  id: string;
}

export class SalaryComponentService {
  /**
   * Get salary components for an employee
   */
  async getEmployeeSalaryComponents(employeeId: string, organisationId: string): Promise<ApiResponse<SalaryComponent[]>> {
    const response = await httpClient.post<ApiResponse<SalaryComponent[]>>(API_ENDPOINTS.SALARY_COMPONENTS_LIST, {
      employee_id: employeeId,
      organisation_id: organisationId,
      include: ['salary_component_type']
    });
    return response.data;
  }

  /**
   * Get all salary components with filters
   */
  async getSalaryComponents(filters: FilterRequest & { include?: string[] }): Promise<ApiResponse<SalaryComponent[]>> {
    const response = await httpClient.post<ApiResponse<SalaryComponent[]>>(API_ENDPOINTS.SALARY_COMPONENTS_LIST, {
      ...filters,
      include: filters.include || ['salary_component_type']
    });
    return response.data;
  }

  /**
   * Create a new salary component
   */
  async createSalaryComponent(data: CreateSalaryComponentRequest): Promise<ApiResponse<SalaryComponent>> {
    const response = await httpClient.post<ApiResponse<SalaryComponent>>(API_ENDPOINTS.SALARY_COMPONENTS_CREATE, data);
    return response.data;
  }

  /**
   * Update a salary component
   */
  async updateSalaryComponent(data: UpdateSalaryComponentRequest): Promise<ApiResponse<SalaryComponent>> {
    const response = await httpClient.put<ApiResponse<SalaryComponent>>(API_ENDPOINTS.SALARY_COMPONENTS_UPDATE, data);
    return response.data;
  }

  /**
   * Delete a salary component
   */
  async deleteSalaryComponent(id: string): Promise<ApiResponse<void>> {
    const response = await httpClient.patch<ApiResponse<void>>(API_ENDPOINTS.SALARY_COMPONENTS_DELETE, { id });
    return response.data;
  }

  /**
   * Get a single salary component
   */
  async getSalaryComponent(id: string): Promise<ApiResponse<SalaryComponent>> {
    const response = await httpClient.post<ApiResponse<SalaryComponent>>(API_ENDPOINTS.SALARY_COMPONENTS_ONE, { 
      id,
      include: ['salary_component_type']
    });
    return response.data;
  }
}

export const salaryComponentService = new SalaryComponentService();
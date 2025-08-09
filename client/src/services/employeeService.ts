import { apiClient } from '@/lib/api';
import { Employee, InsertEmployee } from '@shared/schema';
import { FilterRequest, ApiResponse } from '@/types/api';

class EmployeeService {
  async getEmployees(filters: FilterRequest): Promise<ApiResponse<Employee[]>> {
    return apiClient.post<Employee[]>('/employees/list', filters);
  }

  async getEmployee(id: string): Promise<ApiResponse<Employee>> {
    return apiClient.post<Employee>('/employees/one', { id });
  }

  async createEmployee(data: InsertEmployee): Promise<ApiResponse<Employee>> {
    return apiClient.post<Employee>('/employees/create', data);
  }

  async updateEmployee(data: Partial<Employee> & { id: string }): Promise<ApiResponse<Employee>> {
    return apiClient.put<Employee>('/employees/update', data);
  }

  async deleteEmployee(id: string): Promise<ApiResponse<void>> {
    return apiClient.patch<void>('/employees/delete', { id });
  }
}

export const employeeService = new EmployeeService();
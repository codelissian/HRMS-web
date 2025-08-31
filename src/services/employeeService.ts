import { httpClient } from '@/lib/httpClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { Employee, InsertEmployee, EmployeeWithRelations } from '../../shared/schema';
import { FilterRequest, ApiResponse } from '@/types/api';

class EmployeeService {
  /**
   * Get all employees with filters and pagination
   * Supports include parameter for department and designation data
   */
  async getEmployees(filters: FilterRequest & { include?: string[] }): Promise<ApiResponse<EmployeeWithRelations[]>> {
    const response = await httpClient.post<ApiResponse<EmployeeWithRelations[]>>(API_ENDPOINTS.EMPLOYEES_LIST, filters);
    return response.data;
  }

  /**
   * Get a single employee by ID
   * Supports include parameter for department and designation data
   */
  async getEmployee(id: string, include?: string[]): Promise<ApiResponse<EmployeeWithRelations>> {
    try {
      const requestBody: { id: string; include?: string[] } = { id };
      
      if (include && include.length > 0) {
        requestBody.include = include;
      }
      
      const response = await httpClient.post<any>(API_ENDPOINTS.EMPLOYEES_ONE, requestBody);
      
      // Extract the actual data from the nested response structure
      const apiResponse: ApiResponse<EmployeeWithRelations> = {
        status: response.data.status,
        data: response.data.data,
        message: response.data.message || 'Success',
        total_count: response.data.total_count,
        page: response.data.page,
        page_count: response.data.page_count,
        page_size: response.data.page_size
      };
      
      return apiResponse;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }

  /**
   * Create a new employee
   */
  async createEmployee(data: InsertEmployee): Promise<ApiResponse<Employee>> {
    const response = await httpClient.post<ApiResponse<Employee>>(API_ENDPOINTS.EMPLOYEES_CREATE, data);
    return response.data;
  }

  /**
   * Update an existing employee
   */
  async updateEmployee(data: Partial<Employee> & { id: string }): Promise<ApiResponse<Employee>> {
    const response = await httpClient.put<ApiResponse<Employee>>(API_ENDPOINTS.EMPLOYEES_UPDATE, data);
    return response.data;
  }

  /**
   * Delete an employee
   */
  async deleteEmployee(id: string): Promise<ApiResponse<void>> {
    const response = await httpClient.patch<ApiResponse<void>>(API_ENDPOINTS.EMPLOYEES_DELETE, { id });
    return response.data;
  }

  /**
   * Upload employee photo
   */
  async uploadPhoto(employeeId: string, file: File): Promise<ApiResponse<{ image_url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('employee_id', employeeId);
    
    const response = await httpClient.post<ApiResponse<{ image_url: string }>>(
      `${API_ENDPOINTS.EMPLOYEES_UPDATE}/photo`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return response.data;
  }

  /**
   * Get employee attendance
   */
  async getAttendance(employeeId: string, filters: FilterRequest): Promise<ApiResponse<any[]>> {
    const response = await httpClient.post<ApiResponse<any[]>>(API_ENDPOINTS.ATTENDANCE_LIST, {
      employee_id: employeeId,
      ...filters
    });
    return response.data;
  }

  /**
   * Get employee leave history
   */
  async getLeaveHistory(employeeId: string, filters: FilterRequest): Promise<ApiResponse<any[]>> {
    const response = await httpClient.post<ApiResponse<any[]>>(API_ENDPOINTS.LEAVE_REQUESTS_LIST, {
      employee_id: employeeId,
      ...filters
    });
    return response.data;
  }

  /**
   * Get employee salary history
   */
  async getSalaryHistory(employeeId: string, filters: FilterRequest): Promise<ApiResponse<any[]>> {
    const response = await httpClient.post<ApiResponse<any[]>>('/payroll/history', {
      employee_id: employeeId,
      ...filters
    });
    return response.data;
  }

  /**
   * Get employee documents
   */
  async getDocuments(employeeId: string): Promise<ApiResponse<any[]>> {
    const response = await httpClient.post<ApiResponse<any[]>>('/employees/documents', {
      employee_id: employeeId
    });
    return response.data;
  }

  /**
   * Upload employee document
   */
  async uploadDocument(employeeId: string, file: File, documentType: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('employee_id', employeeId);
    formData.append('document_type', documentType);
    
    const response = await httpClient.post<ApiResponse<any>>('/employees/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  /**
   * Download employee document
   */
  async downloadDocument(documentId: string): Promise<Blob> {
    const response = await httpClient.get<Blob>(`/employees/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Get employee statistics
   */
  async getStatistics(employeeId?: string): Promise<ApiResponse<any>> {
    const response = await httpClient.post<ApiResponse<any>>('/employees/statistics', {
      employee_id: employeeId
    });
    return response.data;
  }

  /**
   * Bulk import employees
   */
  async bulkImport(file: File): Promise<ApiResponse<{ success_count: number; error_count: number; errors: any[] }>> {
    // Get organisation ID from auth token
    const organisationId: any = localStorage.getItem('hrms_organisation_id');
    if (!organisationId) {
      throw new Error('Organisation ID not found');
    }

    // Use FormData approach with explicit organisation_id
    const formData = new FormData();
    formData.append('file', file);
    formData.append('organisation_id', organisationId);

    const response = await httpClient.post<ApiResponse<{ success_count: number; error_count: number; errors: any[] }>>(
      '/aggregation/organisation_data/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        includeOrganisationId: false  // Bypass interceptor to avoid conflicts
      }
    );
    return response.data;
  }

  /**
   * Export employees
   */
  async exportEmployees(filters: FilterRequest): Promise<Blob> {
    const response = await httpClient.post<Blob>('/employees/export', filters, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const employeeService = new EmployeeService();
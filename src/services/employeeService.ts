import { httpClient } from '@/lib/httpClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { Employee, InsertEmployee } from '../../shared/schema';
import { FilterRequest, ApiResponse } from '@/types/api';

class EmployeeService {
  /**
   * Get all employees with filters and pagination
   */
  async getEmployees(filters: FilterRequest): Promise<ApiResponse<Employee[]>> {
    const response = await httpClient.post<ApiResponse<Employee[]>>(API_ENDPOINTS.EMPLOYEES_LIST, filters);
    return response.data;
  }

  /**
   * Get a single employee by ID
   */
  async getEmployee(id: string): Promise<ApiResponse<Employee>> {
    const response = await httpClient.post<ApiResponse<Employee>>(API_ENDPOINTS.EMPLOYEES_ONE, { id });
    return response.data;
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
    const organisationId = localStorage.getItem('user_data') ? 
      JSON.parse(localStorage.getItem('user_data')!).organisation_id : null;

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
import { ApiResponse } from '@/types/api';
import { httpClient } from './httpClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T = any>(endpoint: string, options: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; data?: any; includeOrganisationId?: boolean } = {}): Promise<ApiResponse<T>> {
    const method = (options.method || 'POST').toLowerCase();
    const url = `${endpoint}`; // httpClient already applies baseURL

    try {
      let response;
      switch (method) {
        case 'get':
          response = await httpClient.get<ApiResponse<T>>(url, { includeOrganisationId: options.includeOrganisationId });
          break;
        case 'put':
          response = await httpClient.put<ApiResponse<T>>(url, options.data, { includeOrganisationId: options.includeOrganisationId });
          break;
        case 'patch':
          response = await httpClient.patch<ApiResponse<T>>(url, options.data, { includeOrganisationId: options.includeOrganisationId });
          break;
        case 'delete':
          response = await httpClient.delete<ApiResponse<T>>(url, { includeOrganisationId: options.includeOrganisationId });
          break;
        default:
          response = await httpClient.post<ApiResponse<T>>(url, options.data, { includeOrganisationId: options.includeOrganisationId });
      }
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async post<T = any>(endpoint: string, data?: any, options?: { includeOrganisationId?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', data, ...options });
  }

  async put<T = any>(endpoint: string, data?: any, options?: { includeOrganisationId?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', data, ...options });
  }

  async patch<T = any>(endpoint: string, data?: any, options?: { includeOrganisationId?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', data, ...options });
  }

  async uploadFiles(endpoint: string, files: File[], folderPath: string): Promise<ApiResponse<string[]>> {
    const formData = new FormData();
    files.forEach(file => formData.append('files[]', file));
    formData.append('folder_path', folderPath);

    const response = await httpClient.post<ApiResponse<string[]>>(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

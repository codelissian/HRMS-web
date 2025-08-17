import { ApiResponse } from '@/types/api';
import { httpClient } from './httpClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T = any>(endpoint: string, options: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; data?: any } = {}): Promise<ApiResponse<T>> {
    const method = (options.method || 'POST').toLowerCase();
    const url = `${endpoint}`; // httpClient already applies baseURL

    try {
      let response;
      switch (method) {
        case 'get':
          response = await httpClient.get<ApiResponse<T>>(url);
          break;
        case 'put':
          response = await httpClient.put<ApiResponse<T>>(url, options.data);
          break;
        case 'patch':
          response = await httpClient.patch<ApiResponse<T>>(url, options.data);
          break;
        case 'delete':
          response = await httpClient.delete<ApiResponse<T>>(url);
          break;
        default:
          response = await httpClient.post<ApiResponse<T>>(url, options.data);
      }
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', data });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', data });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', data });
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

import axios, { InternalAxiosRequestConfig } from 'axios';
import { authToken } from '@/services/authToken';

// Create axios instance
export const httpClient = axios.create({
  baseURL: 'https://hrms-backend-omega.vercel.app/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
httpClient.interceptors.request.use((config) => {
  const token = authToken.getToken();
  
  if (token) {
    config.headers = config.headers ?? {} as any;
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      authToken.clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Add convenience methods for common HTTP verbs
export const httpClientWithMethods = {
  ...httpClient,
  get: httpClient.get,
  post: httpClient.post,
  put: httpClient.put,
  patch: httpClient.patch,
  delete: httpClient.delete,
};

export type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  responseType?: any;
  onUploadProgress?: (progressEvent: any) => void;
  onDownloadProgress?: (progressEvent: any) => void;
  requireAuth?: boolean;
  cancelPrevious?: boolean;
  timeout?: number;
}; 
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, AxiosProgressEvent } from 'axios';
import { authToken } from '@/services/authToken';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authToken.getToken();
    if (token) {
      config.headers = config.headers ?? {} as any;
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      authToken.clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      console.error('Access denied');
    } else if (error.response?.status >= 500) {
      console.error('Server error occurred');
    }
    return Promise.reject(error);
  }
);

export type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  responseType?: AxiosRequestConfig['responseType'];
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void;
  requireAuth?: boolean;
  cancelPrevious?: boolean;
  timeout?: number;
};

class HttpClient {
  private cancelController: AbortController | null = null;

  cancelRequest(): void {
    if (this.cancelController) {
      this.cancelController.abort();
      this.cancelController = null;
    }
  }

  private buildConfig(method: string, url: string, options: RequestOptions = {}): AxiosRequestConfig {
    const {
      headers = {},
      params = {},
      data = {},
      responseType = 'json',
      onUploadProgress,
      onDownloadProgress,
      requireAuth = true,
      cancelPrevious = false,
      timeout = 10000,
    } = options;

    if (!url) throw new Error('URL is required');

    if (cancelPrevious) {
      this.cancelRequest();
      this.cancelController = new AbortController();
    }

    const config: AxiosRequestConfig = {
      method: method.toLowerCase() as any,
      url,
      headers: { ...headers },
      params,
      data,
      responseType,
      timeout,
      signal: this.cancelController?.signal,
      onUploadProgress,
      onDownloadProgress,
    };

    if (requireAuth) {
      const token = authToken.getToken();
      if (!token) {
        throw new Error('Authentication token required but not found');
      }
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    return config;
  }

  async request<T = any>(method: string, url: string, options: RequestOptions = {}): Promise<AxiosResponse<T>> {
    const config = this.buildConfig(method, url, options);
    return axiosInstance.request<T>(config);
  }

  get<T = any>(url: string, options: RequestOptions = {}) {
    return this.request<T>('get', url, options);
  }

  post<T = any>(url: string, data?: any, options: RequestOptions = {}) {
    return this.request<T>('post', url, { ...options, data });
  }

  put<T = any>(url: string, data?: any, options: RequestOptions = {}) {
    return this.request<T>('put', url, { ...options, data });
  }

  patch<T = any>(url: string, data?: any, options: RequestOptions = {}) {
    return this.request<T>('patch', url, { ...options, data });
  }

  delete<T = any>(url: string, options: RequestOptions = {}) {
    return this.request<T>('delete', url, options);
  }

  async uploadFile<T = any>(url: string, file: File, onProgress?: (progressEvent: AxiosProgressEvent) => void, options: RequestOptions = {}) {
    const formData = new FormData();
    formData.append('file', file);
    return this.post<T>(url, formData, {
      ...options,
      headers: { 'Content-Type': 'multipart/form-data', ...(options.headers || {}) },
      onUploadProgress: onProgress,
    });
  }

  async downloadFile(url: string, filename = 'download', options: RequestOptions = {}) {
    const response = await this.get<Blob>(url, { ...options, responseType: 'blob' });
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    return response;
  }
}

export const httpClient = new HttpClient(); 
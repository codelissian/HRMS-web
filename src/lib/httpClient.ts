import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosProgressEvent } from 'axios';
import { authToken } from '@/services/authToken';
import { API_BASE_URL } from '@/services/api/endpoints';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Utility function to check if an endpoint is authentication-related
const isAuthEndpoint = (url: string): boolean => {
  const authPatterns = [
    '/auth/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/refresh-token',
    '/verify',
    '/logout'
  ];
  return authPatterns.some(pattern => url.includes(pattern));
};

// Utility function to add organisation_id to request data
const addOrganisationIdToData = (data: any, organisationId: string): any => {
  if (!data) return { organisation_id: organisationId };
  if (typeof data === 'object') {
    return { ...data, organisation_id: organisationId };
  }
  return data;
};

// Utility function to add organisation_id to query parameters
const addOrganisationIdToParams = (params: any, organisationId: string): any => {
  if (!params) return { organisation_id: organisationId };
  if (typeof params === 'object') {
    return { ...params, organisation_id: organisationId };
  }
  return params;
};

// Request interceptor to add auth token and organisation_id
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authToken.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Check if we should include organisation_id
    // Default to true unless explicitly set to false
    const includeOrganisationId = (config as any).includeOrganisationId !== false;
    const shouldIncludeOrgId = includeOrganisationId && !isAuthEndpoint(config.url || '');
    
    // Debug logging
    console.log('🔍 Interceptor Debug:', {
      url: config.url,
      method: config.method,
      includeOrganisationId,
      shouldIncludeOrgId,
      isAuthEndpoint: isAuthEndpoint(config.url || ''),
      organisationId: authToken.getorganisationId()
    });

    if (shouldIncludeOrgId) {
      const organisationId = authToken.getorganisationId();
      
      if (organisationId) {
        if (config.method === 'get' || config.method === 'GET') {
          config.params = addOrganisationIdToParams(config.params, organisationId);
          console.log('✅ Added org_id to params:', config.params);
        } else {
          config.data = addOrganisationIdToData(config.data, organisationId);
          console.log('✅ Added org_id to data:', config.data);
        }
      } else {
        console.log('❌ No organisation_id found in localStorage');
      }
    } else {
      console.log('❌ Skipping org_id addition:', { includeOrganisationId, isAuthEndpoint: isAuthEndpoint(config.url || '') });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      authToken.clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Request options type
// export interface RequestOptions {
// // Add convenience methods for common HTTP verbs
// export const httpClientWithMethods = {
//   ...httpClient,
//   get: httpClient.get,
//   post: httpClient.post,
//   put: httpClient.put,
//   patch: httpClient.patch,
//   delete: httpClient.delete,
// };

export type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  responseType?: AxiosRequestConfig['responseType'];
  timeout?: number;
  /**
   * Whether to include organisation_id in the request.
   * Defaults to true. Set to false to exclude organisation_id.
   */
  includeOrganisationId?: boolean;
}

// HTTP Client class
class HttpClient {
  private axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  private buildConfig(options: RequestOptions = {}, method: string, data?: any): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
      headers: options.headers,
      params: options.params,
      responseType: options.responseType,
      timeout: options.timeout,
    };

    // Store includeOrganisationId option for the interceptor to use
    // Default to true unless explicitly set to false
    (config as any).includeOrganisationId = options.includeOrganisationId !== false;

    return config;
  }

  async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.request(config);
  }

  async get<T = any>(url: string, options: RequestOptions = {}): Promise<AxiosResponse<T>> {
    const config = this.buildConfig(options, 'get');
    return this.axiosInstance.get(url, config);
  }

  async post<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<AxiosResponse<T>> {
    const config = this.buildConfig(options, 'post', data);
    return this.axiosInstance.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<AxiosResponse<T>> {
    const config = this.buildConfig(options, 'put', data);
    return this.axiosInstance.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<AxiosResponse<T>> {
    const config = this.buildConfig(options, 'patch', data);
    return this.axiosInstance.patch(url, data, config);
  }

  async delete<T = any>(url: string, options: RequestOptions = {}): Promise<AxiosResponse<T>> {
    const config = this.buildConfig(options, 'delete');
    return this.axiosInstance.delete(url, config);
  }

  async uploadFile<T = any>(
    url: string,
    file: File,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
    options: RequestOptions = {}
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const config = this.buildConfig(options, 'post', formData);
    config.headers = {
      ...config.headers,
      'Content-Type': 'multipart/form-data',
    };

    return this.axiosInstance.post(url, formData, {
      ...config,
      onUploadProgress,
    });
  }

  async downloadFile(
    url: string,
    options: RequestOptions = {}
  ): Promise<AxiosResponse<Blob>> {
    const config = this.buildConfig(options, 'get');
    config.responseType = 'blob';
    
    return this.axiosInstance.get(url, config);
  }
}

// Export the HTTP client instance
export const httpClient = new HttpClient(axiosInstance);

// Export the axios instance for direct use if needed
export { axiosInstance };

// Export additional types
export type { AxiosRequestConfig, AxiosResponse, AxiosProgressEvent }; 

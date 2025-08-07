import axios from 'axios';
import { authToken } from './authToken';

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authToken.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      authToken.removeToken();
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - handle access denied
      console.error('Access denied');
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

/**
 * HTTP Client Service
 * Provides a clean interface for making API calls with proper error handling
 */
class HttpClient {
  constructor() {
    this.cancelTokenSource = null;
  }

  /**
   * Create a new cancel token source
   */
  createCancelToken() {
    this.cancelTokenSource = axios.CancelToken.source();
    return this.cancelTokenSource.token;
  }

  /**
   * Cancel the current request
   */
  cancelRequest() {
    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel('Request cancelled by user');
    }
  }

  /**
   * Make HTTP request with enhanced configuration
   * @param {string} method - HTTP method (get, post, put, patch, delete)
   * @param {string} url - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} - Axios response promise
   */
  async request(method, url, options = {}) {
    const {
      headers = {},
      params = {},
      data = {},
      responseType = 'json',
      onUploadProgress = null,
      onDownloadProgress = null,
      requireAuth = true,
      cancelPrevious = false,
      timeout = 10000,
    } = options;

    // Validate method
    const validMethods = ['get', 'post', 'put', 'patch', 'delete'];
    if (!validMethods.includes(method.toLowerCase())) {
      throw new Error(`Method ${method} not allowed. Valid methods: ${validMethods.join(', ')}`);
    }

    // Validate URL
    if (!url) {
      throw new Error('URL is required');
    }

    // Handle cancel token
    let cancelToken = null;
    if (cancelPrevious) {
      this.cancelRequest();
      cancelToken = this.createCancelToken();
    }

    // Prepare config
    const config = {
      method: method.toLowerCase(),
      url,
      headers,
      params,
      data,
      responseType,
      timeout,
      cancelToken,
    };

    // Add progress handlers if provided
    if (onUploadProgress) {
      config.onUploadProgress = onUploadProgress;
    }
    if (onDownloadProgress) {
      config.onDownloadProgress = onDownloadProgress;
    }

    // Handle authentication
    if (requireAuth) {
      const token = authToken.getToken();
      if (!token) {
        throw new Error('Authentication token required but not found');
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await axiosInstance(config);
      return response;
    } catch (error) {
      // Enhanced error handling
      if (axios.isCancel(error)) {
        throw new Error('Request was cancelled');
      }
      
      // Re-throw the error for component-level handling
      throw error;
    }
  }

  // Convenience methods for common HTTP operations
  async get(url, options = {}) {
    return this.request('get', url, options);
  }

  async post(url, data = {}, options = {}) {
    return this.request('post', url, { ...options, data });
  }

  async put(url, data = {}, options = {}) {
    return this.request('put', url, { ...options, data });
  }

  async patch(url, data = {}, options = {}) {
    return this.request('patch', url, { ...options, data });
  }

  async delete(url, options = {}) {
    return this.request('delete', url, options);
  }

  /**
   * Upload file with progress tracking
   * @param {string} url - Upload endpoint
   * @param {File} file - File to upload
   * @param {Function} onProgress - Progress callback
   * @param {Object} options - Additional options
   */
  async uploadFile(url, file, onProgress = null, options = {}) {
    const formData = new FormData();
    formData.append('file', file);

    return this.post(url, formData, {
      ...options,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...options.headers,
      },
      onUploadProgress: onProgress,
    });
  }

  /**
   * Download file
   * @param {string} url - Download endpoint
   * @param {string} filename - Filename for download
   * @param {Object} options - Additional options
   */
  async downloadFile(url, filename = 'download', options = {}) {
    const response = await this.get(url, {
      ...options,
      responseType: 'blob',
    });

    // Create download link
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

// Create singleton instance
const httpClient = new HttpClient();

export default httpClient; 
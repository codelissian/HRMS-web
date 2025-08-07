/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://hrms-backend-omega.vercel.app/api/v1',
  VERSION: 'v1',
  TIMEOUT: {
    REQUEST: 10000,
    UPLOAD: 30000,
    DOWNLOAD: 60000,
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
  },
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      PROFILE: '/auth/profile',
      CHANGE_PASSWORD: '/auth/change-password',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      VERIFY_EMAIL: '/auth/verify-email',
    },
    // Employee endpoints
    EMPLOYEES: {
      LIST: '/employees',
      DETAIL: '/employees/:id',
      CREATE: '/employees',
      UPDATE: '/employees/:id',
      DELETE: '/employees/:id',
      PHOTO: '/employees/:id/photo',
      ATTENDANCE: '/employees/:id/attendance',
      LEAVE_HISTORY: '/employees/:id/leaves',
      SALARY_HISTORY: '/employees/:id/salary',
      DOCUMENTS: '/employees/:id/documents',
      UPLOAD_DOCUMENT: '/employees/:id/documents',
      DOWNLOAD_DOCUMENT: '/employees/:id/documents/:documentId',
      STATISTICS: '/employees/:id/statistics',
      BULK_IMPORT: '/employees/bulk-import',
      EXPORT: '/employees/export',
    },
    // Organization endpoints
    ORGANIZATION: {
      BRANCHES: '/organization/branches',
      BRANCH_DETAIL: '/organization/branches/:id',
      CREATE_BRANCH: '/organization/branches',
      UPDATE_BRANCH: '/organization/branches/:id',
      DELETE_BRANCH: '/organization/branches/:id',
    },
    // Leave endpoints
    LEAVES: {
      LIST: '/leaves',
      DETAIL: '/leaves/:id',
      CREATE: '/leaves',
      UPDATE: '/leaves/:id',
      DELETE: '/leaves/:id',
      APPROVE: '/leaves/:id/approve',
      REJECT: '/leaves/:id/reject',
      MY_LEAVES: '/leaves/my-leaves',
    },
    // Payroll endpoints
    PAYROLL: {
      LIST: '/payroll',
      DETAIL: '/payroll/:id',
      CREATE: '/payroll',
      UPDATE: '/payroll/:id',
      DELETE: '/payroll/:id',
      GENERATE: '/payroll/generate',
      MY_SALARY: '/payroll/my-salary',
    },
  },
  UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: {
      IMAGE: ['image/jpeg', 'image/png', 'image/gif'],
      DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      EXCEL: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    },
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
};

/**
 * Get full API URL
 * @param {string} endpoint - API endpoint
 * @returns {string} - Full API URL
 */
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}${endpoint}`;
};

/**
 * Get endpoint with parameters
 * @param {string} endpoint - Endpoint template
 * @param {...any} params - Parameters to substitute
 * @returns {string} - Endpoint with parameters
 */
export const getEndpoint = (endpoint, ...params) => {
  if (typeof endpoint === 'function') {
    return endpoint(...params);
  }
  return endpoint;
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {string} type - File type (image, document, spreadsheet)
 * @returns {Object} - Validation result
 */
export const validateFileUpload = (file, type = 'document') => {
  const maxSize = API_CONFIG.UPLOAD.MAX_SIZE;
  const allowedTypes = API_CONFIG.UPLOAD.ALLOWED_TYPES[type.toUpperCase()] || [];
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }
  
  return { valid: true };
};

/**
 * Format API error message
 * @param {Error} error - Error object
 * @returns {string} - Formatted error message
 */
export const formatApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Access denied. You don\'t have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An unexpected error occurred.';
    }
  }
  
  return error.message || 'An error occurred';
};

export default API_CONFIG; 
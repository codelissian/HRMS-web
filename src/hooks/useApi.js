import React, { useState, useCallback, useRef } from 'react';
import httpClient from '../services/httpClient';

/**
 * Custom hook for making API calls with state management
 * @param {Object} options - Hook options
 * @param {boolean} options.autoExecute - Whether to execute the request immediately
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {Function} options.onFinally - Finally callback
 * @returns {Object} - API state and methods
 */
export const useApi = (options = {}) => {
  const {
    autoExecute = false,
    onSuccess = null,
    onError = null,
    onFinally = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  /**
   * Execute API request
   * @param {string} method - HTTP method
   * @param {string} url - API endpoint
   * @param {Object} requestOptions - Request options
   * @returns {Promise} - API response
   */
  const execute = useCallback(async (method, url, requestOptions = {}) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await httpClient.request(method, url, {
        ...requestOptions,
        signal: abortControllerRef.current.signal,
      });

      setData(response.data);
      
      if (onSuccess) {
        onSuccess(response.data, response);
      }

      return response;
    } catch (err) {
      // Don't set error if request was cancelled
      if (err.name === 'AbortError') {
        return;
      }

      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(err, errorMessage);
      }

      throw err;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
      
      if (onFinally) {
        onFinally();
      }
    }
  }, [onSuccess, onError, onFinally]);

  /**
   * GET request
   * @param {string} url - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} - API response
   */
  const get = useCallback(async (url, options = {}) => {
    return execute('get', url, options);
  }, [execute]);

  /**
   * POST request
   * @param {string} url - API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise} - API response
   */
  const post = useCallback(async (url, data = {}, options = {}) => {
    return execute('post', url, { ...options, data });
  }, [execute]);

  /**
   * PUT request
   * @param {string} url - API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise} - API response
   */
  const put = useCallback(async (url, data = {}, options = {}) => {
    return execute('put', url, { ...options, data });
  }, [execute]);

  /**
   * PATCH request
   * @param {string} url - API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise} - API response
   */
  const patch = useCallback(async (url, data = {}, options = {}) => {
    return execute('patch', url, { ...options, data });
  }, [execute]);

  /**
   * DELETE request
   * @param {string} url - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} - API response
   */
  const del = useCallback(async (url, options = {}) => {
    return execute('delete', url, options);
  }, [execute]);

  /**
   * Upload file
   * @param {string} url - Upload endpoint
   * @param {File} file - File to upload
   * @param {Function} onProgress - Progress callback
   * @param {Object} options - Additional options
   * @returns {Promise} - Upload response
   */
  const uploadFile = useCallback(async (url, file, onProgress = null, options = {}) => {
    return httpClient.uploadFile(url, file, onProgress, options);
  }, []);

  /**
   * Download file
   * @param {string} url - Download endpoint
   * @param {string} filename - Filename for download
   * @param {Object} options - Additional options
   * @returns {Promise} - Download response
   */
  const downloadFile = useCallback(async (url, filename = 'download', options = {}) => {
    return httpClient.downloadFile(url, filename, options);
  }, []);

  /**
   * Cancel current request
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Reset API state
   */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    // State
    data,
    loading,
    error,
    
    // Methods
    execute,
    get,
    post,
    put,
    patch,
    delete: del,
    uploadFile,
    downloadFile,
    cancel,
    reset,
  };
};

/**
 * Hook for making a single API call
 * @param {Function} apiCall - API call function
 * @param {Object} options - Hook options
 * @returns {Object} - API state and execute function
 */
export const useApiCall = (apiCall, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

/**
 * Hook for making API calls with automatic execution
 * @param {Function} apiCall - API call function
 * @param {Array} dependencies - Dependencies for automatic execution
 * @param {Object} options - Hook options
 * @returns {Object} - API state
 */
export const useApiEffect = (apiCall, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Auto-execute when dependencies change
  React.useEffect(() => {
    execute();
  }, dependencies);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}; 
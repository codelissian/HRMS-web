import httpClient from '../httpClient';

/**
 * Employee API Service
 * Handles all employee-related API calls
 */
class EmployeeApiService {
  /**
   * Get all employees with pagination and filtering
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {string} params.department - Department filter
   * @param {string} params.status - Status filter
   * @param {string} params.branchId - Branch filter
   * @returns {Promise} - Employees list response
   */
  async getEmployees(params = {}) {
    try {
      const response = await httpClient.get('/employees', { params });
      return response.data;
    } catch (error) {
      throw this.handleEmployeeError(error);
    }
  }

  /**
   * Get employee by ID
   * @param {string} id - Employee ID
   * @returns {Promise} - Employee details response
   */
  async getEmployee(id) {
    try {
      const response = await httpClient.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleEmployeeError(error);
    }
  }

  /**
   * Create new employee
   * @param {Object} employeeData - Employee data
   * @returns {Promise} - Created employee response
   */
  async createEmployee(employeeData) {
    try {
      const response = await httpClient.post('/employees', employeeData);
      return response.data;
    } catch (error) {
      throw this.handleEmployeeError(error);
    }
  }

  /**
   * Update employee
   * @param {string} id - Employee ID
   * @param {Object} employeeData - Updated employee data
   * @returns {Promise} - Updated employee response
   */
  async updateEmployee(id, employeeData) {
    try {
      const response = await httpClient.put(`/employees/${id}`, employeeData);
      return response.data;
    } catch (error) {
      throw this.handleEmployeeError(error);
    }
  }

  /**
   * Delete employee
   * @param {string} id - Employee ID
   * @returns {Promise} - Delete response
   */
  async deleteEmployee(id) {
    try {
      const response = await httpClient.delete(`/employees/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleEmployeeError(error);
    }
  }

  /**
   * Upload employee photo
   * @param {string} id - Employee ID
   * @param {File} file - Photo file
   * @param {Function} onProgress - Upload progress callback
   * @returns {Promise} - Upload response
   */
  async uploadPhoto(id, file, onProgress = null) {
    try {
      const response = await httpClient.uploadFile(
        `/employees/${id}/photo`,
        file,
        onProgress
      );
      return response.data;
    } catch (error) {
      throw this.handleEmployeeError(error);
    }
  }

  /**
   * Get employee attendance
   * @param {string} id - Employee ID
   * @param {Object} params - Query parameters
   * @param {string} params.startDate - Start date
   * @param {string} params.endDate - End date
   * @returns {Promise} - Attendance data response
   */
  async getAttendance(id, params = {}) {
    try {
      const response = await httpClient.get(`/employees/${id}/attendance`, { params });
      return response.data;
    } catch (error) {
      throw this.handleEmployeeError(error);
    }
  }

  /**
   * Get employee leave history
   * @param {string} id - Employee ID
   * @param {Object} params - Query parameters
   * @returns {Promise} - Leave history response
   */
  async getLeaveHistory(id, params = {}) {
    try {
      const response = await httpClient.get(`/employees/${id}/leaves`, { params });
      return response.data;
    } catch (error) {
      throw this.handleEmployeeError(error);
    }
  }

  /**
   * Get employee salary history
   * @param {string} id - Employee ID
   * @param {Object} params - Query parameters
   * @returns {Promise} - Salary history response
   */
  async getSalaryHistory(id, params = {}) {
    try {
      const response = await httpClient.get(`/employees/${id}/salary`, { params });
      return response.data;
    } catch (error) {
      throw this.handleEmployeeError(error);
    }
  }

  /**
   * Get employee documents
   * @param {string} id - Employee ID
   * @returns {Promise} - Documents response
   */
  async getDocuments(id) {
    try {
      const response = await httpClient.get(`/employees/${id}/documents`);
      return response.data;
    } catch (error) {
      throw this.handleEmployeeError(error);
    }
  }

  /**
   * Upload employee document
   * @param {string} id - Employee ID
   * @param {File} file - Document file
   * @param {string} documentType - Type of document
   * @param {Function} onProgress - Upload progress callback
   * @returns {Promise} - Upload response
   */
  async uploadDocument(id, file, documentType, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const response = await httpClient.post(`/employees/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress,
      });
      return response.data;
    } catch (error) {
      throw this.handleEmployeeError(error);
    }
  }

  /**
   * Download employee document
   * @param {string} id - Employee ID
   * @param {string} documentId - Document ID
   * @param {string} filename - Filename for download
   * @returns {Promise} - Download response
   */
  async downloadDocument(id, documentId, filename) {
    try {
      const response = await httpClient.downloadFile(
        `/employees/${id}/documents/${documentId}`,
        filename
      );
      return response;
    } catch (error) {
      throw this.handleEmployeeError(error);
    }
  }

  /**
   * Get employee statistics
   * @param {string} id - Employee ID
   * @returns {Promise} - Statistics response
   */
  async getStatistics(id) {
    try {
      const response = await httpClient.get(`/employees/${id}/statistics`);
      return response.data;
    } catch (error) {
      throw this.handleEmployeeError(error);
    }
  }

  /**
   * Bulk import employees
   * @param {File} file - CSV/Excel file
   * @param {Function} onProgress - Upload progress callback
   * @returns {Promise} - Import response
   */
  async bulkImport(file, onProgress = null) {
    try {
      const response = await httpClient.uploadFile(
        '/employees/bulk-import',
        file,
        onProgress
      );
      return response.data;
    } catch (error) {
      throw this.handleEmployeeError(error);
    }
  }

  /**
   * Export employees data
   * @param {Object} params - Export parameters
   * @param {string} params.format - Export format (csv, excel, pdf)
   * @param {Array} params.fields - Fields to export
   * @param {Object} params.filters - Filter criteria
   * @returns {Promise} - Export response
   */
  async exportEmployees(params = {}) {
    try {
      const response = await httpClient.get('/employees/export', { 
        params,
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      throw this.handleEmployeeError(error);
    }
  }

  /**
   * Handle employee-specific errors
   * @param {Error} error - Axios error
   * @returns {Error} - Formatted error
   */
  handleEmployeeError(error) {
    if (error.response?.status === 404) {
      return new Error('Employee not found');
    } else if (error.response?.status === 422) {
      return new Error(error.response.data.message || 'Validation failed');
    } else if (error.response?.status === 409) {
      return new Error('Employee with this email already exists');
    } else if (error.response?.status >= 500) {
      return new Error('Employee service unavailable. Please try again later.');
    } else {
      return new Error(error.response?.data?.message || 'Employee operation failed');
    }
  }
}

// Create singleton instance
const employeeApi = new EmployeeApiService();

export default employeeApi; 
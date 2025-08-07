import httpClient from '../httpClient';

/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */
class AuthApiService {
  /**
   * User login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise} - Login response
   */
  async login(credentials) {
    try {
      const response = await httpClient.post('/auth/login', credentials, {
        requireAuth: false,
      });
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * User registration
   * @param {Object} userData - User registration data
   * @returns {Promise} - Registration response
   */
  async register(userData) {
    try {
      const response = await httpClient.post('/auth/register', userData, {
        requireAuth: false,
      });
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * User logout
   * @returns {Promise} - Logout response
   */
  async logout() {
    try {
      const response = await httpClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      // Even if logout fails on server, we should clear local auth
      console.warn('Logout API call failed:', error);
      return { success: true };
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} - Token refresh response
   */
  async refreshToken(refreshToken) {
    try {
      const response = await httpClient.post('/auth/refresh', { refreshToken }, {
        requireAuth: false,
      });
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user profile
   * @returns {Promise} - User profile response
   */
  async getProfile() {
    try {
      const response = await httpClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} - Profile update response
   */
  async updateProfile(profileData) {
    try {
      const response = await httpClient.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Change password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise} - Password change response
   */
  async changePassword(passwordData) {
    try {
      const response = await httpClient.post('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} - Password reset request response
   */
  async requestPasswordReset(email) {
    try {
      const response = await httpClient.post('/auth/forgot-password', { email }, {
        requireAuth: false,
      });
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Reset password with token
   * @param {Object} resetData - Password reset data
   * @param {string} resetData.token - Reset token
   * @param {string} resetData.newPassword - New password
   * @returns {Promise} - Password reset response
   */
  async resetPassword(resetData) {
    try {
      const response = await httpClient.post('/auth/reset-password', resetData, {
        requireAuth: false,
      });
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Verify email with token
   * @param {string} token - Email verification token
   * @returns {Promise} - Email verification response
   */
  async verifyEmail(token) {
    try {
      const response = await httpClient.post('/auth/verify-email', { token }, {
        requireAuth: false,
      });
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Handle authentication-specific errors
   * @param {Error} error - Axios error
   * @returns {Error} - Formatted error
   */
  handleAuthError(error) {
    if (error.response?.status === 401) {
      return new Error('Invalid credentials');
    } else if (error.response?.status === 422) {
      return new Error(error.response.data.message || 'Validation failed');
    } else if (error.response?.status === 429) {
      return new Error('Too many login attempts. Please try again later.');
    } else if (error.response?.status >= 500) {
      return new Error('Authentication service unavailable. Please try again later.');
    } else {
      return new Error(error.response?.data?.message || 'Authentication failed');
    }
  }
}

// Create singleton instance
const authApi = new AuthApiService();

export default authApi; 
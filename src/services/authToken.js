/**
 * Authentication Token Service
 * Handles JWT token storage, retrieval, and validation
 */

const TOKEN_KEY = 'hrms_auth_token';
const REFRESH_TOKEN_KEY = 'hrms_refresh_token';

class AuthTokenService {
  /**
   * Store authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  /**
   * Get stored authentication token
   * @returns {string|null} - JWT token or null
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Remove authentication token
   */
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  /**
   * Store refresh token
   * @param {string} refreshToken - Refresh token
   */
  setRefreshToken(refreshToken) {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Get stored refresh token
   * @returns {string|null} - Refresh token or null
   */
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Remove refresh token
   */
  removeRefreshToken() {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Clear all authentication data
   */
  clearAuth() {
    this.removeToken();
    this.removeRefreshToken();
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if token exists and is valid
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Check if token is expired
      const payload = this.decodeToken(token);
      if (!payload) return false;

      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      this.clearAuth();
      return false;
    }
  }

  /**
   * Decode JWT token (without verification)
   * @param {string} token - JWT token
   * @returns {Object|null} - Decoded payload or null
   */
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  /**
   * Get user information from token
   * @returns {Object|null} - User information or null
   */
  getUserInfo() {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    return payload ? payload.user || payload : null;
  }

  /**
   * Check if token is about to expire (within 5 minutes)
   * @returns {boolean} - True if token expires soon
   */
  isTokenExpiringSoon() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return false;

      const currentTime = Date.now() / 1000;
      const fiveMinutes = 5 * 60; // 5 minutes in seconds
      
      return payload.exp - currentTime < fiveMinutes;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
export const authToken = new AuthTokenService(); 
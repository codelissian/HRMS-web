const TOKEN_KEY = 'hrms_auth_token';
const REFRESH_TOKEN_KEY = 'hrms_refresh_token';

class AuthTokenService {
  setToken(token: string | null | undefined): void {
    if (token) localStorage.setItem(TOKEN_KEY, token);
  }
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
  setRefreshToken(refreshToken: string | null | undefined): void {
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  removeRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
  clearAuth(): void {
    this.removeToken();
    this.removeRefreshToken();
  }
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = this.decodeToken(token);
      if (!payload || typeof payload.exp !== 'number') return false;
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      this.clearAuth();
      return false;
    }
  }
  decodeToken(token: string): Record<string, any> | null {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
  getUserInfo(): Record<string, any> | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = this.decodeToken(token);
    return payload ? (payload.user ?? payload) : null;
  }
  isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = this.decodeToken(token);
      if (!payload || typeof payload.exp !== 'number') return false;
      const now = Date.now() / 1000;
      return payload.exp - now < 5 * 60;
    } catch {
      return false;
    }
  }
}

export const authToken = new AuthTokenService(); 
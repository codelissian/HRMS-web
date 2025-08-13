const TOKEN_KEY = 'hrms_auth_token';
const REFRESH_TOKEN_KEY = 'hrms_refresh_token';
const ORGANISATION_ID_KEY = 'hrms_organisation_id';

export const authToken = {
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  setRefreshToken: (refreshToken: string) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  removeRefreshToken: () => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  clearAuth(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeorganisationId();
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload || typeof payload.exp !== 'number') return false;
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  },

  getUserInfo: (): Record<string, any> | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload ? (payload.user ?? payload) : null;
    } catch {
      return null;
    }
  },

  // organisation ID methods
  setorganisationId(organisationId: string | number | null | undefined): void {
    if (organisationId) {
      localStorage.setItem(ORGANISATION_ID_KEY, String(organisationId));
    }
  },

  getorganisationId(): string | null {
    return localStorage.getItem(ORGANISATION_ID_KEY);
  },

  removeorganisationId(): void {
    localStorage.removeItem(ORGANISATION_ID_KEY);
  },

  // Method to extract and store organisation_id from login response
  processLoginResponse(response: any): void {
    // Extract organisation_id from various possible locations in the response
    console.log(response.data.admin.organisations[0].id);
    let organisationId = response?.data?.admin?.organisations[0].id;
    
    if (organisationId) {
      this.setorganisationId(organisationId);
    }
  }
}; 

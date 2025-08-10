import { httpClient } from '@/lib/httpClient';
import { API_ENDPOINTS as API } from '@/services/api/endpoints';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';
import { authToken } from '@/services/authToken';

function normalizeAuthResponse(raw: any): AuthResponse {
  const payload = (raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw) || raw;

  const access_token = payload?.access_token || payload?.token || payload?.jwt || payload?.tokens?.access || '';
  const refresh_token = payload?.refresh_token || payload?.tokens?.refresh || '';

  const admin = payload?.admin || (payload?.user?.role === 'admin' ? payload.user : undefined);
  const employee = payload?.employee || (payload?.user?.role === 'employee' ? payload.user : undefined);

  // Try multiple possible locations for organisation data
  let organisation = payload?.organisation || payload?.organisation;
  
  // If no organisation in payload, try to get it from admin/employee data
  if (!organisation && admin?.organisation) {
    organisation = admin.organisation;
  } else if (!organisation && employee?.organisation) {
    organisation = employee.organisation;
  }
  
  // If still no organisation, try to get it from the user object
  if (!organisation && payload?.user?.organisation) {
    organisation = payload.user.organisation;
  }
  
  // Fallback to empty organisation if none found
  if (!organisation) {
    organisation = { id: '', name: '' };
  }

  return {
    admin,
    employee,
    organisation,
    access_token,
    refresh_token,
  } as AuthResponse;
}

class AuthService {
  async adminLogin(credentials: LoginRequest): Promise<AuthResponse> {
    const resp = await httpClient.post(API.AUTH_ADMIN_LOGIN, credentials, { includeorganisationId: false });
    const authResponse = normalizeAuthResponse(resp.data);
    
    // Process login response to extract and store organisation_id
    authToken.processLoginResponse(resp.data);
    
    return authResponse;
  }

  async employeeLogin(credentials: LoginRequest): Promise<AuthResponse> {
    const resp = await httpClient.post(API.AUTH_EMPLOYEE_LOGIN, credentials, { includeorganisationId: false });
    const authResponse = normalizeAuthResponse(resp.data);
    
    // Process login response to extract and store organisation_id
    authToken.processLoginResponse(resp.data);
    
    return authResponse;
  }

  // Convenience method to preserve existing callers
  async login(credentials: LoginRequest & { user_type?: 'admin' | 'employee' }): Promise<AuthResponse> {
    const userType = credentials.user_type || 'employee';
    return userType === 'admin' ? this.adminLogin(credentials) : this.employeeLogin(credentials);
  }

  async adminRegister(data: RegisterRequest): Promise<any> {
    const resp = await httpClient.post(API.AUTH_ADMIN_REGISTER, data, { includeorganisationId: false });
    return resp.data;
  }

  async adminVerify(email: string, otp: string): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>(API.AUTH_ADMIN_VERIFY, {
      email,
      otp,
    }, { includeorganisationId: false });
    const authResponse = normalizeAuthResponse(response.data);
    
    // Process login response to extract and store organisation_id
    authToken.processLoginResponse(response.data);
    
    return authResponse;
  }

  async resetPassword(data: {
    email?: string;
    mobile?: string;
    otp: string;
    new_password: string;
  }): Promise<void> {
    await httpClient.post(API.AUTH_ADMIN_RESET_PASSWORD, data, { includeorganisationId: false });
  }
}

export const authService = new AuthService();
